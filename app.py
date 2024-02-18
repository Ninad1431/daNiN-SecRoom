# app.py
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

active_users = {}  # Dictionary to store active users in each room

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):
    code, username = data['code'], data['username']
    join_room(code)

    if code in active_users:
        active_users[code][request.sid] = username
    else:
        active_users[code] = {request.sid: username}

    # Increment the active user count
    active_count = len(active_users[code])
    emit('message', {'message': f'{username} has joined the room.', 'username': 'System', 'activeUsers': active_count}, room=code)
    emit_active_users(code)

@socketio.on('message')
def handle_message(data):
    message, code, username = data['message'], data['code'], data['username']
    emit('message', {'message': message, 'code': code, 'username': username}, room=code)

@socketio.on('leave')
def handle_leave(data):
    code, username = data['code'], data['username']
    leave_room(code)

    if code in active_users and request.sid in active_users[code]:
        del active_users[code][request.sid]

    # Decrement the active user count
    active_count = len(active_users[code])
    emit('message', {'message': f'{username} has left the room.', 'username': 'System', 'activeUsers': active_count}, room=code)
    emit_active_users(code)

@socketio.on('disconnect')
def handle_disconnect():
    for code, users in active_users.items():
        if request.sid in users:
            username = users[request.sid]
            leave_room(code)
            del active_users[code][request.sid]
            
            # Decrement the active user count
            active_count = len(active_users[code])
            emit('message', {'message': f'{username} has left the room.', 'username': 'System', 'activeUsers': active_count}, room=code)
            emit_active_users(code)
            break

# Function to emit 'activeUsers' event
def emit_active_users(code):
    # Emit the count of active users
    emit('activeUsers', {'activeUsers': len(active_users[code])}, room=code)

if __name__ == '__main__':
    socketio.run(app, debug=True)
