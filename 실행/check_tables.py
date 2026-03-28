import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env.local")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Env vars not set")
    exit(1)

supabase: Client = create_client(url, key)
tables = ['schedules', 'breaks', 'holidays', 'events', 'partners']

print("--- Supabase Table Integrity Check ---")
for table in tables:
    try:
        response = supabase.table(table).select("*").limit(1).execute()
        print(f"✅ {table}: EXISTS")
    except Exception as e:
        if "404" in str(e) or "does not exist" in str(e).lower():
            print(f"❌ {table}: MISSING")
        else:
            print(f"⚠️ {table}: ERROR ({str(e)})")
