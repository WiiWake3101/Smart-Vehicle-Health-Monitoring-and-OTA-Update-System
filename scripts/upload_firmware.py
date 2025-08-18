import requests  # type: ignore
import sys
import os
import json
from datetime import datetime

# Default path for binary files
DEFAULT_BIN_PATH = r"C:\Users\vivek\OneDrive\Documents\Arduino\Devops"
# Path to .env file
ENV_FILE_PATH = r"C:\Users\vivek\OneDrive\Desktop\CS\Devops\.env"

def load_env_file(env_path):
    """Load environment variables from a .env file"""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as file:
            for line in file:
                line = line.strip()
                if line and not line.startswith('//') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    return env_vars

# First try to get credentials from environment variables, then from .env file
SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
SUPABASE_API_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY")

# If not found in environment variables, try loading from .env file
if not SUPABASE_URL or not SUPABASE_API_KEY:
    env_vars = load_env_file(ENV_FILE_PATH)
    SUPABASE_URL = SUPABASE_URL or env_vars.get("SUPABASE_URL")
    SUPABASE_API_KEY = SUPABASE_API_KEY or env_vars.get("SUPABASE_ANON_KEY")

# Check if credentials are set
if not SUPABASE_URL or not SUPABASE_API_KEY:
    print("Error: SUPABASE_URL and SUPABASE_API_KEY must be set either in environment variables or in .env file")
    print(f"Checked .env file at: {ENV_FILE_PATH}")
    sys.exit(1)

def get_firmware_versions(device_type=None):
    """Retrieve firmware versions from the database, optionally filtered by device type"""
    headers = {
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json"
    }
    
    db_url = f"{SUPABASE_URL}/rest/v1/firmware"
    params = {}
    
    if device_type:
        params["device_type"] = f"eq.{device_type}"
    
    response = requests.get(
        db_url,
        headers=headers,
        params=params
    )
    
    if response.status_code != 200:
        print(f"Error retrieving firmware versions: {response.text}")
        return []
    
    return response.json()

def version_exists(version, device_type):
    """Check if a specific firmware version for a device type already exists"""
    headers = {
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json"
    }
    
    db_url = f"{SUPABASE_URL}/rest/v1/firmware"
    params = {
        "version": f"eq.{version}",
        "device_type": f"eq.{device_type}"
    }
    
    response = requests.get(
        db_url,
        headers=headers,
        params=params
    )
    
    if response.status_code != 200:
        print(f"Error checking version existence: {response.text}")
        return False
    
    return len(response.json()) > 0

def upload_firmware(binary_path, version, device_type, is_mandatory=False, force=False):
    # Check if version already exists
    if not force and version_exists(version, device_type):
        print(f"Firmware version {version} for {device_type} already exists. Use --force to overwrite.")
        return False
    
    # First, upload the binary file to Supabase Storage
    with open(binary_path, 'rb') as f:
        binary_data = f.read()
    
    # Create a unique filename
    filename = f"{device_type}_{version}_{datetime.now().strftime('%Y%m%d%H%M%S')}.bin"
    
    # Upload to Supabase Storage
    storage_url = f"{SUPABASE_URL}/storage/v1/object/firmware/{filename}"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "apikey": SUPABASE_API_KEY,
    }
    
    response = requests.post(
        storage_url,
        headers=headers,
        data=binary_data
    )
    
    if response.status_code != 200:
        print(f"Error uploading binary: {response.text}")
        return False
    
    print(f"Binary uploaded successfully to storage")
    
    # Get the public URL
    binary_url = f"{SUPABASE_URL}/storage/v1/object/public/firmware/{filename}"
    
    # Now register the firmware in the database
    db_url = f"{SUPABASE_URL}/rest/v1/firmware"
    
    firmware_data = {
        "version": version,
        "device_type": device_type,
        "binary_url": binary_url,
        "is_mandatory": is_mandatory,
        "release_notes": f"Demo release for version {version}"
    }
    
    response = requests.post(
        db_url,
        headers={
            **headers,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        data=json.dumps(firmware_data)
    )
    
    if response.status_code != 201:
        print(f"Error registering firmware: {response.text}")
        return False
    
    print(f"Firmware version {version} registered successfully")
    return True

def resolve_binary_path(binary_path):
    """Resolve the binary path, checking the default location if needed"""
    # If it's an absolute path or exists as is, return it
    if os.path.isabs(binary_path) or os.path.exists(binary_path):
        return binary_path
    
    # Check if it exists in the default bin directory
    default_path = os.path.join(DEFAULT_BIN_PATH, binary_path)
    if os.path.exists(default_path):
        return default_path
    
    # Add .bin extension if not present and check again
    if not binary_path.endswith('.bin'):
        with_extension = binary_path + '.bin'
        if os.path.exists(with_extension):
            return with_extension
        
        default_with_extension = os.path.join(DEFAULT_BIN_PATH, with_extension)
        if os.path.exists(default_with_extension):
            return default_with_extension
    
    return binary_path  # Return original path, will fail later if it doesn't exist

def list_binary_files():
    """List all binary files in the default directory"""
    if not os.path.exists(DEFAULT_BIN_PATH):
        print(f"Default binary directory does not exist: {DEFAULT_BIN_PATH}")
        return []
    
    bin_files = []
    for file in os.listdir(DEFAULT_BIN_PATH):
        if file.endswith('.bin'):
            bin_files.append(file)
    
    return bin_files

def auto_detect_and_upload():
    """Automatically detect and upload all binary files in the default directory"""
    bin_files = list_binary_files()
    if not bin_files:
        print(f"No binary files found in {DEFAULT_BIN_PATH}")
        return False
    
    print(f"Found {len(bin_files)} binary file(s) in {DEFAULT_BIN_PATH}")
    
    # Track if all uploads were successful
    all_success = True
    
    for file in bin_files:
        file_path = os.path.join(DEFAULT_BIN_PATH, file)
        print(f"Processing {file}...")
        
        # Use improved device type detection
        device_type = auto_detect_device_type(file)
        
        # Generate version based on timestamp with more precision
        version = datetime.now().strftime("%y.%m.%d.%H%M%S")
        
        # Upload with auto-detected parameters
        success = upload_firmware(file_path, version, device_type)
        
        if not success:
            all_success = False
    
    return all_success

def delete_firmware(version=None, device_type=None, all_versions=False):
    """Delete firmware versions from the database"""
    if not all_versions and (not version or not device_type):
        print("Error: Either specify version and device_type, or use --all flag")
        return False
        
    headers = {
        "Authorization": f"Bearer {SUPABASE_API_KEY}",
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    db_url = f"{SUPABASE_URL}/rest/v1/firmware"
    params = {}
    
    if not all_versions:
        params["version"] = f"eq.{version}"
        params["device_type"] = f"eq.{device_type}"
    else:
        # Add a condition that's always true when deleting all records
        # This is required by Supabase - DELETE requires a WHERE clause
        params["id"] = "gt.0"  # All IDs greater than 0
    
    # First get the records to retrieve storage URLs
    get_response = requests.get(
        db_url,
        headers=headers,
        params=params
    )
    
    if get_response.status_code != 200:
        print(f"Error retrieving firmware versions: {get_response.text}")
        return False
        
    records = get_response.json()
    if not records:
        print("No matching firmware versions found")
        return False
        
    print(f"Found {len(records)} firmware version(s) to delete")
    
    # Delete records from the database
    delete_response = requests.delete(
        db_url,
        headers=headers,
        params=params
    )
    
    if delete_response.status_code != 200 and delete_response.status_code != 204:
        print(f"Error deleting firmware versions: {delete_response.text}")
        return False
    
    print(f"Successfully deleted {len(records)} firmware version(s) from database")
    
    # Also delete storage files
    for record in records:
        if "binary_url" in record:
            # Extract filename from URL
            url_parts = record["binary_url"].split("/")
            if len(url_parts) > 0:
                filename = url_parts[-1]
                storage_url = f"{SUPABASE_URL}/storage/v1/object/firmware/{filename}"
                
                delete_storage_response = requests.delete(
                    storage_url,
                    headers=headers
                )
                
                if delete_storage_response.status_code != 200 and delete_storage_response.status_code != 204:
                    print(f"Warning: Could not delete storage file: {filename}")
                else:
                    print(f"Deleted storage file: {filename}")
    
    return True

def auto_detect_device_type(filename):
    """Better detection of device type from filename"""
    # Common device types to check for
    device_types = ["esp32", "esp8266", "arduino", "stm32", "rp2040"]
    
    # Convert filename to lowercase for case-insensitive matching
    lower_filename = filename.lower()
    
    # First check if any device type is directly in the filename
    for device in device_types:
        if device in lower_filename:
            return device
            
    # If underscore separation is used
    if "_" in filename:
        parts = filename.split("_")
        if parts and parts[0]:
            # Check if first part is a known device type
            if parts[0].lower() in device_types:
                return parts[0].lower()
            return parts[0]  # Use first part as device type
    
    # Default fallback
    return "esp32"

if __name__ == "__main__":
    # Run in auto mode if no arguments are provided
    if len(sys.argv) < 2:
        print("Running in automatic mode - detecting and uploading binaries...")
        print(f"Looking for binary files in: {DEFAULT_BIN_PATH}")
        success = auto_detect_and_upload()
        sys.exit(0 if success else 1)
    
    command = sys.argv[1].lower()
    
    if command == "upload":
        if len(sys.argv) < 5:
            print("Usage: python upload_firmware.py upload <binary_path> <version> <device_type> [is_mandatory] [--force]")
            sys.exit(1)
        
        binary_path = resolve_binary_path(sys.argv[2])
        version = sys.argv[3]
        device_type = sys.argv[4]
        is_mandatory = sys.argv[5].lower() == "true" if len(sys.argv) > 5 else False
        force = "--force" in sys.argv
        
        if not os.path.exists(binary_path):
            print(f"Binary file not found: {binary_path}")
            print(f"Checked in default directory: {DEFAULT_BIN_PATH}")
            sys.exit(1)
        
        success = upload_firmware(binary_path, version, device_type, is_mandatory, force)
        sys.exit(0 if success else 1)
    
    elif command == "list":
        device_type = sys.argv[2] if len(sys.argv) > 2 else None
        versions = get_firmware_versions(device_type)
        
        if not versions:
            print("No firmware versions found")
        else:
            print(f"Found {len(versions)} firmware version(s):")
            for v in versions:
                mandatory = "MANDATORY" if v.get("is_mandatory") else "optional"
                print(f"  {v.get('device_type')} v{v.get('version')} - {mandatory}")
                print(f"    URL: {v.get('binary_url')}")
                print(f"    Notes: {v.get('release_notes')}")
                print()
    
    elif command == "binaries":
        bin_files = list_binary_files()
        if not bin_files:
            print(f"No binary files found in {DEFAULT_BIN_PATH}")
        else:
            print(f"Found {len(bin_files)} binary file(s) in {DEFAULT_BIN_PATH}:")
            for file in bin_files:
                file_path = os.path.join(DEFAULT_BIN_PATH, file)
                size = os.path.getsize(file_path) / 1024  # Convert to KB
                print(f"  {file} ({size:.1f} KB)")
    
    elif command == "delete":
        if len(sys.argv) < 3:
            print("Usage: python upload_firmware.py delete <version> <device_type> or delete --all")
            sys.exit(1)
            
        if sys.argv[2] == "--all":
            success = delete_firmware(all_versions=True)
        elif len(sys.argv) < 4:
            print("Error: Both version and device_type are required")
            sys.exit(1)
        else:
            version = sys.argv[2]
            device_type = sys.argv[3]
            success = delete_firmware(version, device_type)
            
        sys.exit(0 if success else 1)
    
    else:
        print(f"Unknown command: {command}")
        print("Available commands: upload, list, binaries, delete")
        sys.exit(1)