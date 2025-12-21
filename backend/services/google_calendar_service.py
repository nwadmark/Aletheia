"""
Google Calendar integration service.
Handles OAuth authentication and calendar event synchronization.
"""
import os
import logging
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from utils.encryption import decrypt_token, encrypt_token

logger = logging.getLogger(__name__)


class GoogleCalendarService:
    """Service for interacting with Google Calendar API."""
    
    # Google Calendar API scopes
    SCOPES = ['https://www.googleapis.com/auth/calendar.events']
    
    # Calendar colors (map severity to Google Calendar color IDs)
    SEVERITY_COLORS = {
        'mild': '2',      # Green
        'moderate': '5',  # Yellow
        'severe': '11',   # Red
    }
    
    def __init__(self):
        """Initialize the Google Calendar service."""
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
        
        if not all([self.client_id, self.client_secret, self.redirect_uri]):
            raise ValueError(
                "Missing required Google OAuth credentials. "
                "Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI"
            )
    
    def get_credentials(self, encrypted_refresh_token: str) -> Credentials:
        """
        Build credentials from stored encrypted refresh token.
        
        Args:
            encrypted_refresh_token: Encrypted refresh token from database
            
        Returns:
            Google OAuth2 Credentials object
            
        Raises:
            ValueError: If token is invalid or cannot be decrypted
        """
        try:
            refresh_token = decrypt_token(encrypted_refresh_token)
            
            credentials = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=self.SCOPES
            )
            
            # Refresh the access token if needed
            if not credentials.valid:
                if credentials.expired and credentials.refresh_token:
                    credentials.refresh(Request())
                else:
                    raise ValueError("Invalid credentials")
            
            return credentials
            
        except Exception as e:
            logger.error(f"Failed to get credentials: {e}")
            raise ValueError(f"Failed to authenticate with Google Calendar: {e}")
    
    def create_altheia_calendar(self, credentials: Credentials) -> str:
        """
        Create a dedicated "Altheia Health" calendar.
        
        Args:
            credentials: Valid Google OAuth2 credentials
            
        Returns:
            Calendar ID of the created or existing calendar
            
        Raises:
            HttpError: If calendar creation fails
        """
        try:
            service = build('calendar', 'v3', credentials=credentials)
            
            # Check if calendar already exists
            calendar_list = service.calendarList().list().execute()
            for calendar in calendar_list.get('items', []):
                if calendar.get('summary') == 'Altheia Health':
                    logger.info(f"Found existing Altheia Health calendar: {calendar['id']}")
                    return calendar['id']
            
            # Create new calendar
            calendar = {
                'summary': 'Altheia Health',
                'description': 'Symptom logs from Altheia health tracking app',
                'timeZone': 'UTC'
            }
            
            created_calendar = service.calendars().insert(body=calendar).execute()
            calendar_id = created_calendar['id']
            
            logger.info(f"Created new Altheia Health calendar: {calendar_id}")
            return calendar_id
            
        except HttpError as e:
            logger.error(f"Failed to create calendar: {e}")
            raise
    
    def sync_symptom_log(
        self,
        credentials: Credentials,
        calendar_id: str,
        log_data: Dict[str, Any],
        event_id: Optional[str] = None
    ) -> str:
        """
        Create or update a calendar event from a symptom log.
        
        Args:
            credentials: Valid Google OAuth2 credentials
            calendar_id: ID of the Altheia Health calendar
            log_data: Symptom log data containing date, symptoms, notes, etc.
            event_id: Existing event ID for updates (None for new events)
            
        Returns:
            Event ID of the created/updated event
            
        Raises:
            HttpError: If event creation/update fails
        """
        try:
            service = build('calendar', 'v3', credentials=credentials)
            
            # Format event data
            event = self._format_event(log_data)
            
            if event_id:
                # Update existing event
                updated_event = service.events().update(
                    calendarId=calendar_id,
                    eventId=event_id,
                    body=event
                ).execute()
                logger.info(f"Updated calendar event: {event_id}")
                return updated_event['id']
            else:
                # Create new event
                created_event = service.events().insert(
                    calendarId=calendar_id,
                    body=event
                ).execute()
                logger.info(f"Created calendar event: {created_event['id']}")
                return created_event['id']
                
        except HttpError as e:
            logger.error(f"Failed to sync symptom log: {e}")
            raise
    
    def delete_symptom_log(
        self,
        credentials: Credentials,
        calendar_id: str,
        event_id: str
    ) -> None:
        """
        Delete a calendar event.
        
        Args:
            credentials: Valid Google OAuth2 credentials
            calendar_id: ID of the Altheia Health calendar
            event_id: ID of the event to delete
            
        Raises:
            HttpError: If event deletion fails
        """
        try:
            service = build('calendar', 'v3', credentials=credentials)
            service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            logger.info(f"Deleted calendar event: {event_id}")
            
        except HttpError as e:
            if e.resp.status == 404:
                logger.warning(f"Event not found: {event_id}")
            else:
                logger.error(f"Failed to delete event: {e}")
                raise
    
    def batch_sync_logs(
        self,
        credentials: Credentials,
        calendar_id: str,
        logs: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Sync multiple symptom logs efficiently using batch requests.
        
        Args:
            credentials: Valid Google OAuth2 credentials
            calendar_id: ID of the Altheia Health calendar
            logs: List of symptom log data
            
        Returns:
            Dictionary mapping log IDs to event IDs
            
        Raises:
            HttpError: If batch sync fails
        """
        try:
            service = build('calendar', 'v3', credentials=credentials)
            event_map = {}
            
            # Google Calendar API batch limit is 1000 requests
            batch_size = 100
            
            for i in range(0, len(logs), batch_size):
                batch = logs[i:i + batch_size]
                
                for log in batch:
                    try:
                        event = self._format_event(log)
                        created_event = service.events().insert(
                            calendarId=calendar_id,
                            body=event
                        ).execute()
                        
                        log_id = log.get('_id') or log.get('id')
                        event_map[str(log_id)] = created_event['id']
                        
                    except HttpError as e:
                        logger.error(f"Failed to sync log {log.get('_id')}: {e}")
                        continue
            
            logger.info(f"Batch synced {len(event_map)} logs")
            return event_map
            
        except HttpError as e:
            logger.error(f"Failed to batch sync logs: {e}")
            raise
    
    def get_event_by_log_id(
        self,
        credentials: Credentials,
        calendar_id: str,
        log_id: str
    ) -> Optional[str]:
        """
        Find a calendar event by Altheia log ID.
        
        Args:
            credentials: Valid Google OAuth2 credentials
            calendar_id: ID of the Altheia Health calendar
            log_id: Altheia symptom log ID
            
        Returns:
            Event ID if found, None otherwise
        """
        try:
            service = build('calendar', 'v3', credentials=credentials)
            
            # Search for event with matching log_id in extended properties
            events = service.events().list(
                calendarId=calendar_id,
                privateExtendedProperty=f'altheia_log_id={log_id}'
            ).execute()
            
            items = events.get('items', [])
            if items:
                return items[0]['id']
            
            return None
            
        except HttpError as e:
            logger.error(f"Failed to find event for log {log_id}: {e}")
            return None
    
    def _format_event(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format symptom log data into Google Calendar event format.
        
        Args:
            log_data: Symptom log data
            
        Returns:
            Formatted event dictionary
        """
        # Extract data
        log_date = log_data.get('date')
        symptoms = log_data.get('symptoms', [])
        notes = log_data.get('notes', '')
        log_id = log_data.get('_id') or log_data.get('id')
        
        # Determine severity level
        severity = self._calculate_severity(symptoms)
        
        # Build description
        description_parts = ['Symptoms:']
        for symptom in symptoms:
            name = symptom.get('name', 'Unknown')
            severity_level = symptom.get('severity', 0)
            description_parts.append(f'- {name}: {severity_level}/5')
        
        if notes:
            description_parts.append(f'\nNotes: {notes}')
        
        description = '\n'.join(description_parts)
        
        # Format date for all-day event
        if isinstance(log_date, str):
            event_date = log_date
        elif isinstance(log_date, (date, datetime)):
            event_date = log_date.strftime('%Y-%m-%d')
        else:
            event_date = datetime.utcnow().strftime('%Y-%m-%d')
        
        # Build event
        event = {
            'summary': f'Symptom Log: {severity.capitalize()}',
            'description': description,
            'start': {'date': event_date},
            'end': {'date': event_date},
            'colorId': self.SEVERITY_COLORS.get(severity, '1'),
            'extendedProperties': {
                'private': {
                    'altheia_log_id': str(log_id),
                    'source': 'altheia_app'
                }
            }
        }
        
        return event
    
    def _calculate_severity(self, symptoms: List[Dict[str, Any]]) -> str:
        """
        Calculate overall severity level from symptoms.
        
        Args:
            symptoms: List of symptom dictionaries with severity ratings
            
        Returns:
            Severity level: 'mild', 'moderate', or 'severe'
        """
        if not symptoms:
            return 'mild'
        
        # Calculate average severity
        total_severity = sum(s.get('severity', 0) for s in symptoms)
        avg_severity = total_severity / len(symptoms)
        
        if avg_severity >= 4:
            return 'severe'
        elif avg_severity >= 2.5:
            return 'moderate'
        else:
            return 'mild'