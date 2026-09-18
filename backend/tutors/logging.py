# logging.py

import logging

# Create a logger instance
logger = logging.getLogger(__name__)

# Define a logging configuration
def configure_logging():
    logging.basicConfig(
        level=logging.DEBUG,  # Adjust logging level as needed
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),  # Log to console
            logging.FileHandler('app.log'),  # Log to a file (e.g., 'app.log')
        ]
    )
