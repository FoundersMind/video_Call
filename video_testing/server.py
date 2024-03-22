import asyncio
import websockets
import json

# Define a list to store users
users = []

async def handle_websocket(websocket, path):
    global users
    
    async for message in websocket:
        data = json.loads(message)

        # Find the user
        user = find_user(data['username'])

        # Handle different types of messages
        if data['type'] == 'store_user':
            if user is not None:
                return
            new_user = {
                'conn': websocket,
                'username': data['username']
            }
            users.append(new_user)
            print(new_user['username'])
        elif data['type'] == 'store_offer':
            if user is None:
                return
            user['offer'] = data['offer']  # Make sure to set the 'offer' key
        elif data['type'] == 'store_candidate':
            if user is None:
                return
            user.setdefault('candidates', []).append(data['candidate'])
        elif data['type'] == 'send_answer':
            if user is None:
                return
            await send_data({
                'type': 'answer',
                'answer': data['answer']
            }, user['conn'])
        elif data['type'] == 'send_candidate':
            if user is None:
                return
            await send_data({
                'type': 'candidate',
                'candidate': data['candidate']
            }, user['conn'])
        elif data['type'] == 'join_call':
            if user is None:
                return
            if 'offer' in user:  # Check if 'offer' key is present before accessing it
                await send_data({
                    'type': 'offer',
                    'offer': user['offer']
                }, websocket)
            if 'candidates' in user:
                for candidate in user['candidates']:
                    await send_data({
                        'type': 'candidate',
                        'candidate': candidate
                    }, websocket)

async def send_data(data, conn):
    await conn.send(json.dumps(data))

def find_user(username):
    for user in users:
        if user['username'] == username:
            return user

# Start WebSocket server

start_server = websockets.serve(handle_websocket, "localhost", 9000)

try:
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
    print("Server stopped by user.")
finally:
    print("Cleaning up resources.")
    # Add any cleanup code here if needed
