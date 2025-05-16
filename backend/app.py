from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///conscious.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])

try:
    from nlp_module import interpret_dream
    from focus_tracker import track_focus
    from group_session import manage_group_session
except ImportError as e:
    print(f"Import error: {e}")
    def interpret_dream(dream_text):
        return f"Mock interpretation: {dream_text}"
    def track_focus(user_id, focus_data):
        return {"status": "mock success", "user_id": user_id}
    def manage_group_session(user_id, session_data):
        return {"status": "mock success", "user_id": user_id, "session_data": session_data}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    progress = db.Column(db.Float, default=0.0)

@app.route('/progress', methods=['POST'])
def progress():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id, progress=0.0)
            db.session.add(user)
            db.session.commit()
        return jsonify({'progress': user.progress})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/dream', methods=['POST'])
def dream():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        dream_text = data.get('dream_text')
        if not user_id or not dream_text:
            return jsonify({'error': 'Missing user_id or dream_text'}), 400
        interpretation = interpret_dream(dream_text)
        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id, progress=0.0)
            db.session.add(user)
        user.progress += 10.0
        db.session.commit()
        return jsonify({'interpretation': interpretation, 'progress': user.progress})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/join_session', methods=['POST'])
def join_session():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        session_data = data.get('session_data', {})
        result = manage_group_session(user_id, session_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('dream')
def handle_dream(data):
    print(f"Received dream event: {data}")
    try:
        user_id = data.get('user_id')
        dream_text = data.get('dream_text')
        if not user_id or not dream_text:
            emit('dream_response', {'error': 'Missing user_id or dream_text'})
            return
        interpretation = interpret_dream(dream_text)
        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id, progress=0.0)
            db.session.add(user)
        user.progress += 10.0
        db.session.commit()
        emit('dream_response', {'response': interpretation, 'progress': user.progress})
    except Exception as e:
        emit('dream_response', {'error': str(e)})

@socketio.on('focus')
def handle_focus(data):
    print(f"Received focus event: {data}")
    user_id = data.get('user_id')
    focus_data = data.get('focus_data')
    track_focus(user_id, focus_data)

@socketio.on('group_session')
def handle_group_session_socket(data):
    print(f"Received group_session event: {data}")
    try:
        user_id = data.get('user_id')
        session_data = data.get('session_data')
        if not user_id or not session_data:
            emit('session_response', {'error': 'Missing user_id or session_data'})
            return
        result = manage_group_session(user_id, session_data)
        emit('session_response', result)
    except Exception as e:
        emit('session_response', {'error': str(e)})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)