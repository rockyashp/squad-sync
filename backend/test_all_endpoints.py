import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def req(endpoint, method="GET", body=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(body).encode('utf-8') if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            res_data = res.read().decode('utf-8')
            return res.status, json.loads(res_data) if res_data else {}
    except urllib.error.HTTPError as e:
        err_data = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_data)
        except:
            return e.code, {"error": err_data}

print("--- 1. Login gamer ---")
status, res = req("/auth/login", "POST", {"username_or_email": "gamer@squadsync.gg", "password": "password123"})
print(f"Login status: {status}")
token = res["data"]["access_token"]

print("--- 2. Auth me ---")
status, me_res = req("/auth/me", "GET", token=token)
gamer_user_id = me_res["data"]["id"]
print(f"Me status: {status}, gamer_tag: {me_res['data'].get('gamer_tag')}, is_admin: {me_res['data'].get('is_admin')}")

print("--- 3. Friends List ---")
status, res = req("/friends", "GET", token=token)
print(f"Friends status: {status}, count: {len(res['data']) if 'data' in res else res}")
if 'data' in res and res['data']:
    print("Friend 0:", res['data'][0])

print("--- 4. Pending Requests ---")
status, res = req("/friends/requests", "GET", token=token)
print(f"Requests status: {status}, count: {len(res['data']) if 'data' in res else res}")

print("--- 5. Search Gamers ---")
status, res = req("/friends/search?q=radiant", "GET", token=token)
print(f"Search status: {status}, results: {len(res['data']) if 'data' in res else res}")

print("--- 6. Get DNA ---")
status, res = req("/dna", "GET", token=token)
print(f"DNA status: {status}, archetype: {res['data'].get('primary_archetype') if 'data' in res and res['data'] else None}")

print("--- 7. Generate DNA from frontend survey ---")
survey_body = {
    "playstyle": "AGGRESSIVE",
    "communication_style": "VOCAL",
    "preferred_tactics": "RUSH",
    "answers": {
        "1": 5, "2": 4, "3": 5, "4": 3, "5": 4
    }
}
status, res = req("/dna/generate", "POST", survey_body, token=token)
print(f"Generate DNA status: {status}, archetype: {res.get('data', {}).get('primary_archetype')}")

print("--- 8. Matchmaking Evaluate Team ---")
eval_body = {
    "game": "Valorant",
    "roles": ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"]
}
status, res = req("/matchmaking/evaluate-team", "POST", eval_body, token=token)
eval_data = res.get('data') if isinstance(res, dict) else {}
print(f"Evaluate Team status: {status}, synergy: {eval_data.get('synergy_score') if eval_data else res}")

print("--- 9. Squads Hub (My Squads) ---")
status, res = req("/teams/my", "GET", token=token)
print(f"My Squads status: {status}, squads: {len(res.get('data', []))}")
if res.get('data'):
    print("Squad 0:", res['data'][0]['name'], "Members:", len(res['data'][0].get('members', [])))

print("--- 10. News Hub ---")
status, res = req("/news", "GET", token=token)
print(f"News status: {status}, count: {len(res.get('data', []))}")

print("--- 11. Admin Login & Dashboard ---")
status, res = req("/auth/login", "POST", {"username_or_email": "admin@squadsync.gg", "password": "password123"})
admin_token = res["data"]["access_token"]

status, res = req("/admin/analytics", "GET", token=admin_token)
print(f"Admin Analytics status: {status}, kpis: {list(res.get('data', {}).keys())}")

status, res = req("/admin/users", "GET", token=admin_token)
print(f"Admin Users status: {status}, total users: {len(res.get('data', []))}")

status, res = req("/admin/reports", "GET", token=admin_token)
print(f"Admin Reports status: {status}, total reports: {len(res.get('data', []))}")

print("ALL CHECKS FINISHED")
