import string
import random
import time
from datetime import datetime
from flask import * # Flask, g, redirect, render_template, request, url_for
from functools import wraps
import sqlite3
from collections import defaultdict

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/belay.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one: 
            return rows[0]
        return rows
    return None

def new_user():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (name, password, api_key),
        one=True)
    return u

@app.route('/')
@app.route('/profile')
@app.route('/profile/')
@app.route('/login')
@app.route('/login/')
@app.route('/channel')
@app.route('/channel/')
@app.route('/channel/<int:channel_id>')
@app.route('/channel/<int:channel_id>/<int:message_id>')
def index(channel_id=None, message_id=None):
    # time.sleep(4)
    return app.send_static_file('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404



# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/signup', methods=["POST"])
def signup():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' + 
        'values (?, ?, ?) returning id, name, password, api_key',
        (name, password, api_key),
        one=True)
    if u:
        return jsonify({
            "username": name,
            "api_key": api_key,
            "code": 200
        }), 200
    else:
        return jsonify({
            "error": "Invalid username.",
            "code": 400
        }), 400

@app.route('/api/login', methods=["POST"])
def login():
    name = request.json['username']
    password = request.json['password']

    u = query_db('select * from users where name = ? and password = ?', [name, password], one=True)

    if u:
        return jsonify({
            "api_key": u["api_key"],
            "code": 200,
        }), 200
    else:
        return jsonify({
            "error": "Invalid username or password.",
            "code": 400
        }), 400

# POST to change the user's name
@app.route('/api/user/username', methods=["PUT"])
def update_username():
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400

    data = request.get_json()
    name = data.get('name')

    # check if the name exists
    temp = query_db('select * from users where name = ?', [name], one=True)
    if temp:
        return jsonify({'code': 400, "error": "Invalid username."}), 400

    query_db('UPDATE users SET name = ? WHERE id = ?', [name, u['id']])
    return jsonify({'code': 200}), 200


# POST to change the user's password
@app.route('/api/user/password', methods=["PUT"])
def update_password():
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    data = request.get_json()
    password = data.get('password')
    query_db('UPDATE users SET password = ? WHERE id = ?', [password, u['id']])
    return jsonify({'code': 200}), 200

# GET to get all channels. When user not log in, return empty list.
@app.route('/api/channels', methods=["GET"])
def get_channels():
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    channels = query_db('''
                SELECT c.id, c.name, COUNT(m2.message_id) AS unread
                FROM channels c
                LEFT JOIN (
                    SELECT m.id AS message_id, m.channel_id
                    FROM messages m
                    LEFT JOIN seen_messages s ON s.channel_id = m.channel_id AND s.user_id = ?
                    WHERE (m.id > IFNULL(s.last_seen_message_id, 0) OR s.last_seen_message_id IS NULL) AND m.replies_to IS NULL
                ) AS m2 ON c.id = m2.channel_id
                GROUP BY c.id, c.name;
            ''', [u["id"]])

    if not channels:
        return jsonify({"channels": [], 'code': 200}), 200
    data = []
    for channel in channels:
        data.append({"id": channel["id"], "name": channel["name"], "unread": channel["unread"]})
    return jsonify({'channels': data, 'code': 200}), 200

# POST to create a channel
@app.route('/api/channel/new', methods=['POST'])
def create_channel():
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    name = "NewChannel " + ''.join(random.choices(string.digits, k=6))
    channel = query_db('insert into channels (name) values (?) returning id', [name], one=True)            
    return jsonify({'id': channel["id"], 'code': 200}), 200

# GET to get all the messages in a channel
@app.route('/api/channels/<int:channel_id>', methods=["GET"])
def get_messages(channel_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    channelName = query_db('select name from channels where id = ?', [channel_id], one=True)
    if not channelName:
        return jsonify({'code': 404, "error": "Channel doesn't exist."}), 404
    
    messages = query_db("""
                        SELECT u.name, m.body, m.id, m.replies_to, m.user_id, 
                        GROUP_CONCAT(r.emoji || ':' || (SELECT name from users where id = r.user_id)) as reactions,
                        (SELECT COUNT(*) FROM messages WHERE replies_to = m.id) AS reply
                        FROM messages m
                        LEFT JOIN users u
                            ON u.id = m.user_id
                        LEFT JOIN reactions r
                            ON m.id = r.message_id
                        WHERE m.channel_id = ? AND m.replies_to IS NULL
                        GROUP BY u.name, m.body, m.id, m.replies_to, m.user_id
                        ORDER BY m.id 
                        """, [channel_id])
    if not messages:
        return jsonify({'code': 200, "messages": [], "channelName": channelName["name"]}), 200
    data = []
    for message in messages:
        emojis = {
            '👍':[],
            '❤️':[],
            '😄':[],
            '😂':[],           
        }
        if message["reactions"]:
            reactions = message["reactions"].split(",")
            for reaction in reactions:
                emoji, user = reaction.split(":")
                emojis[emoji].append(user)
        data.append({"id": message["id"], "name": message["name"], "content": message["body"], "reply": message["reply"], "reactions": emojis})

    # Update most recent messages#
    query_db('''
        INSERT INTO seen_messages (user_id, channel_id, last_seen_message_id) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, channel_id) 
        DO UPDATE SET last_seen_message_id=excluded.last_seen_message_id
        ''', [u["id"], channel_id, messages[-1]["id"]])
    
    return jsonify({'code': 200,"messages": data, "channelName": channelName["name"]}), 200

# POST to post a new message to a channel
@app.route('/api/channels/<int:channel_id>', methods=["POST"])
def post_message(channel_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    channelName = query_db('select name from channels where id = ?', [channel_id], one=True)
    if not channelName:
        return jsonify({'code': 404, "error": "Channel doesn't exist."}), 404

    request.get_json()
    data = request.get_json()
    user_id = u['id']
    body = data.get('body')

    query_db("INSERT INTO messages (user_id, channel_id, body) VALUES (?, ?, ?)", (user_id, channel_id, body))
    return jsonify({'code': 200}), 200

# GET to get all the messages in a thread
@app.route('/api/threads/<int:channel_id>/<int:thread_id>', methods=["GET"])
def get_thread_messages(channel_id, thread_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    thread = query_db('select * from messages where channel_id = ? and id = ?', [channel_id, thread_id], one=True)
    if not thread:
        return jsonify({'code': 404, "error": "Thread doesn't exist."}), 404

    channelName = query_db('select name from channels where id = ?', [channel_id], one=True)
    
    messages = query_db("""SELECT u.name, m.body, m.id,
                        GROUP_CONCAT(r.emoji || ':' || (SELECT name from users where id = r.user_id)) as reactions
                        FROM messages m
                        LEFT JOIN users u
                            ON u.id = m.user_id
                        LEFT JOIN reactions r
                            ON m.id = r.message_id
                        WHERE m.replies_to = ? OR m.id = ?
                        GROUP BY u.name, m.body, m.id
                        ORDER BY m.id 
                        """, [thread_id, thread_id])

    if not messages:
        return jsonify({'code': 200, "messages": [], "channelName": channelName["name"]}), 200
    data = []
    for message in messages:
        emojis = {
            '👍':[],
            '❤️':[],
            '😄':[],
            '😂':[],           
        }
        if message["reactions"]:
            reactions = message["reactions"].split(",")
            for reaction in reactions:
                emoji, user = reaction.split(":")
                emojis[emoji].append(user)

        data.append({"id": message["id"], "name": message["name"], "content": message["body"], "reactions": emojis})

    return jsonify({'code': 200,"messages": data, "channelName": channelName["name"]}), 200

# POST to post a new message to a thread
@app.route('/api/threads/<int:channel_id>/<int:thread_id>', methods=["POST"])
def post_thread_message(channel_id, thread_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    thread = query_db('select * from messages where channel_id = ? and id = ?', [channel_id, thread_id], one=True)
    if not thread:
        return jsonify({'code': 404, "error": "Thread doesn't exist."}), 404

    request.get_json()
    data = request.get_json()
    user_id = u['id']
    body = data.get('body')

    query_db("INSERT INTO messages (user_id, channel_id, body, replies_to) VALUES (?, ?, ?, ?)", (user_id, channel_id, body, thread_id))
    return jsonify({'code': 200}), 200

# PUT to change the name of a channel
@app.route('/api/channels/<int:channel_id>/name', methods=['PUT'])
def update_channel_name(channel_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400

    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'code': 400, "error": "Invalid Name"}, 400)

    query_db("UPDATE channels SET name = ? WHERE id = ?", (name, channel_id))
    return jsonify({'code': 200}), 200

# POST to add a reaction to a thread
@app.route('/api/reactions/<int:thread_id>', methods=["POST"])
def add_reaction(thread_id):
    api_key = request.headers.get('Api-Key')
    u = query_db('select * from users where api_key = ?', [api_key], one=True)
    if not u:
        return jsonify({'code': 400, "error": "Invalid api_key."}), 400
    
    request.get_json()
    data = request.get_json()
    user_id = u['id']
    body = data.get('body')

    query_db("""
            INSERT INTO reactions (emoji, message_id, user_id)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1
                FROM reactions
                WHERE emoji = ?
                AND message_id = ?
                AND user_id = ?
            )
            """, (body, thread_id, user_id, body, thread_id, user_id))
    return jsonify({'code': 200}), 200

if __name__ == "__main__":
    app.run(host="localhost", debug=True)