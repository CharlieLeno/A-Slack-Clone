const UPDATE_FREQ = 500

///////////////////////////////////////////Splash///////////////////////////////////////////////
class Header extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let isLoggedIn = this.props.isLoggedIn;
        let username = this.props.username;

        return (
            <div className="header">
                <div className="loginHeader">
                    {!isLoggedIn && <div className="loggedOut" onClick={() => this.props.setPath("/login")}>
                        <a>Login</a>
                    </div>
                    }
                    {isLoggedIn && <div className="loggedIn" onClick={() => this.props.setPath("/profile")}>
                        <a className="welcomeBack">
                            <span className="username">{username}</span>
                            <span className="material-symbols-outlined md-18">person</span>
                        </a>
                    </div>}
                </div>
            </div>
        );
    }
}

class Hero extends React.Component {
    constructor(props) {
        super(props);
    }

    signup() {
        signupApi()
            .then(() => {
                this.props.setLogin(localStorage.getItem("qileichen_username"));
                this.props.setPath("/profile");
            })
            .catch(error => {
                console.error('Failure to signup: ', error);
            });
    }

    render() {
        let isLoggedIn = this.props.isLoggedIn;

        return (
            <div className="hero">
                <div className="logo">
                    <img id="tv" src="/static/images/tv.jpeg" alt="TV" />
                    <img id="popcorn" src="/static/images/popcorn.png" alt="Popcorn" />
                </div>
                <h1>Belay</h1>
                {!isLoggedIn && <button className="logged-out" onClick={() => this.props.setPath("/login")}>Login</button>}
                {!isLoggedIn && <button className="logged-out" onClick={() => this.signup()}>Signup</button>}
                {isLoggedIn && <button className="logged-in" onClick={() => { this.props.setPath("/channel") }}>Go To Channels!</button>}
            </div>
        );
    }
}

class Splash extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let isLoggedIn = this.props.isLoggedIn;

        return (
            <div className="splash container">
                <Header
                    isLoggedIn={isLoggedIn}
                    setPath={this.props.setPath}
                    setLogin={this.props.setLogin}
                    setLogout={this.props.setLogout}
                    username={this.props.username}
                />
                <Hero
                    isLoggedIn={isLoggedIn}
                    setPath={this.props.setPath}
                    setLogin={this.props.setLogin}
                    setLogout={this.props.setLogout}
                />
            </div>
        );
    }
}

///////////////////////////////////////////Profile///////////////////////////////////////////////

class ProfileClip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            repeatPassword: '',
        };
    }

    handleUsernameChange = (event) => {
        this.setState({ username: event.target.value });
    }

    handlePasswordChange = (event) => {
        this.setState({ password: event.target.value });
    }

    handleRepeatPasswordChange = (event) => {
        this.setState({ repeatPassword: event.target.value });
    }

    updateUsername() {
        let newName = this.state.username;
        if (newName == localStorage.getItem("qileichen_username")) {
            return;
        }
        updateUsername(newName)
            .then(() => {
                this.props.setLogin(localStorage.getItem("qileichen_username"));
            })
            .catch(error => {
                console.error('Failure to update the username: ', error);
            });
    }

    updatePassword() {
        if (this.state.password == "") {
            return;
        }
        if (this.state.password != this.state.repeatPassword) {
            alert("Password doesn't match");
            return
        }

        updatePassword(this.state.password);
    }

    logout() {
        this.props.setLogout();
        this.props.setPath("/");
    }

    componentDidMount() {
        this.setState({ username: localStorage.getItem("qileichen_username") });
    }

    render() {
        let isLoggedIn = this.props.isLoggedIn;

        return (
            <div className="clip">
                <div className="auth container">
                    <h2>Welcome to Belay!</h2>
                    <div className="alignedForm">
                        <label htmlFor="update_username">Username: </label>
                        <input
                            id="update_username"
                            value={this.state.username}
                            onChange={this.handleUsernameChange}
                        />
                        <button onClick={() => this.updateUsername()}>update</button>

                        <label htmlFor="update_password">Password: </label>
                        <input
                            type="password"
                            id="update_password"
                            onChange={this.handlePasswordChange}
                        />
                        <button onClick={() => this.updatePassword()}>update</button>

                        <label htmlFor="repeat_password">Repeat: </label>
                        <input
                            type="password"
                            id="repeat_password"
                            onChange={this.handleRepeatPasswordChange}
                        />
                        <button className="exit goToSplash" onClick={() => { this.props.setPath("/channel") }}>Cool, let's go!</button>
                        <button className="exit logout" onClick={() => { this.logout() }}>Log out</button>
                    </div>

                </div>
            </div>
        );
    }
}

class Profile extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="profile">
                <Header
                    isLoggedIn={true}
                    setPath={this.props.setPath}
                    setLogin={this.props.setLogin}
                    setLogout={this.props.setLogout}
                    username={this.props.username}
                />
                <ProfileClip
                    isLoggedIn={true}
                    setPath={this.props.setPath}
                    setLogin={this.props.setLogin}
                    setLogout={this.props.setLogout}
                    username={this.props.username}
                />
            </div>
        );
    }
}


///////////////////////////////////////////Login///////////////////////////////////////////////
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loginFailed: false
        };
    }

    handleLogin = () => {
        const { username, password } = this.state;
        loginApi(username, password)
            .then(() => {
                this.setState({ loginFailed: false });
                this.props.setLogin(username);

                let tempPath = localStorage.getItem("qileichen_temp_path");
                if (tempPath != null) {
                    localStorage.removeItem("qileichen_temp_path");
                    this.props.setPath(tempPath);
                }
            })
            .catch(error => {
                this.setState({ loginFailed: true });
                console.error("Login Failed: ", error);
            });
    };

    signup() {
        signupApi()
            .then(() => {
                this.props.setLogin(localStorage.getItem("qileichen_username"));
                this.props.setPath("/profile");
            })
            .catch(error => {
                console.error('Failure to signup: ', error);
            });
    }

    render() {
        const { username, password, loginFailed } = this.state;
        return (
            <div className="clip">
                <div className="auth container">
                    <h3>Enter your username and password to log in:</h3>
                    <div className="alignedForm login">
                        <label htmlFor="login_username">Username</label>
                        <input
                            id="login_username"
                            value={username}
                            onChange={(e) => this.setState({ username: e.target.value })}
                        />
                        <button onClick={this.handleLogin}>Login</button>
                        <label htmlFor="login_password">Password</label>
                        <input
                            type="password"
                            id="login_password"
                            value={password}
                            onChange={(e) => this.setState({ password: e.target.value })}
                        />
                    </div>
                    {loginFailed && <div className="failed">
                        <div className="message">
                            Oops, that username and password don't match any of our users!
                        </div>
                    </div>}
                    <div>
                        <button onClick={() => { this.signup() }}>Create a new Account</button>
                    </div>
                </div>
            </div>
        );
    }
}


///////////////////////////////////////////Channel///////////////////////////////////////////////
function CloseButton({ onClose }) {
    return (
        <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
        </button>
    );
}

function Reactions({value=null, handleAddReaction=null}) {
    if (handleAddReaction == null) {
        return
    }
    return(
        <div className="reactions">
            {Object.entries(value).map(([emoji, users]) => (
                <button key={emoji} 
                        onClick={() => handleAddReaction(emoji)}
                            title={users.length > 0 ? users.join(', ') : 'Click to React!'}  // Shows user list on hover
                            style={{cursor: 'pointer'}
                        }>
                    {emoji}{users.length == 0 ? "": users.length}
                </button>
            ))}
        </div>
    )
}

function Message({ message, reply=false, openThread=null, handleAddReaction=null}) {
    let text = message.content
    // let reactions = message.reactions
    let reactions = message.reactions;

    const imageUrlRegex = /https?:\/\/.*\.(?:png|jpg|gif|jpeg)/ig;
    const imageUrls = text.match(imageUrlRegex);
    
    return (
        <div className="message">
            <div className="author">{message.name}</div>
            <div className="content">{message.content}</div>
            {imageUrls && imageUrls.map(url => (
            <img className="url-img" key={url} src={url} alt="User Content" style={{ maxWidth: '200px', maxHeight: '200px' }} />
            ))}
            {reply && <span className="reply" onClick={openThread}>{message.reply == 0 ? "" : message.reply} reply</span>}
            <Reactions value={reactions} handleAddReaction={handleAddReaction}/>
        </div>
    )
  }

function Comment({value, handleChange, handleSubmit}) {

    return (
        <div className="comment-box">
            <textarea
                name="comment"
                value={value}
                onChange={handleChange}
            ></textarea>
            <button type="submit" onClick={handleSubmit}>Reply</button>
        </div>
    )
}

class ChannelList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channels: [],
        };
    }

    setCurrentChannel = (channelId) => {
        this.props.setCurrentChannel(channelId);
        this.props.setCurrentThread(0);

        const chat = document.querySelector(".chat");
        chat.classList.remove("channel-thread");

    }

    addChannel = () => {
        createChannel()
            .then(data => {
                this.props.setPath(`/channel/${data.id}`);
                this.fetchChannels();
            })
            .catch(error => {
                console.error('Failure to create new room: ', error);
            })
    }

    fetchChannels = () => {

        let api_key = localStorage.getItem("qileichen_api_key");
        if (!api_key) {
          this.setState({ channels: [] });
          return;
        }

        getChannels()
        .then((data) => {
            this.setState({ channels: data.channels });
        })    
        .catch(error => {
            console.error('Failure to load rooms: ', error);
        })
    }

    componentDidMount() {
        this.fetchChannels();
        this.intervalId = setInterval(this.fetchChannels, UPDATE_FREQ * 2);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    render() {
        const channels = this.state.channels;
        const channelId = this.props.channelId;
        return (
            <div className="channel-list">
                {channels.map(channel => (
                    <button key={channel.id} className={`channel-button ${channel.id == channelId ? 'active-channel' : ''}`} onClick={() => { this.setCurrentChannel(channel.id) }}>
                        # {channel.name}{channel.unread != 0 && <div className="channel-unread">{channel.unread}</div>}
                    </button>
                ))}
                <button className="channel-button add-channel" onClick={() => { this.addChannel() }}>
                    + Add Channel
                </button>
            </div>

        );
    }
}

class ChannelItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            comment: '',
            messageUpdate: true,
            newChannelName: "",
            messages:[],
            channelName: "",
        };
    }

    setCurrentThread = (id) => {
        this.props.setCurrentThread(id);
    }

    fetchChannelItem = () => {
        let api_key = localStorage.getItem("qileichen_api_key");
        if (!api_key) {
          this.setState({ messages: [] });
          return;
        }
        getChannelItem(this.props.channelId)
        .then(data => {
            // this.setCurrentChannel(data.channelId);
            this.setState({messages: data.messages, channelName: data.channelName});
        })
        .catch(error => {
                console.error('Failure to update the channel messages: ', error);
                this.props.setPath("/channel")
        })
    }

    componentDidMount() {
        this.fetchChannelItem();
        this.intervalId = setInterval(this.fetchChannelItem, UPDATE_FREQ);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    toggleEdit = () => {
        this.setState(prevState => ({
            isEditing: !prevState.isEditing
        }));
        this.setState({newChannelName: ""});
    }

    handleChannelNameChange = (event) => {
        this.setState({ newChannelName: event.target.value });
    }

    updateChannelName = () => {
        updateChannelName(this.props.channelId, this.state.newChannelName);
        this.toggleEdit();
    }

    openThread = (message) => {
        this.props.setPath("/channel/" + this.props.channelId + "/" + message.id);
        this.props.setCurrentThread(message.id);
        console.log("messagethread", message.id);
    }

    handleCommentChange = (event) => {
        this.setState({ comment: event.target.value });
    }

    postMessage = () => {
        postCahnnelMessage(this.props.channelId, this.state.comment);
        this.setState({comment: ""});
    }

    handleClose = () => {
        this.props.setPath("/channel");
    }

    handleAddReaction = (emoji, message) => {
        addRection(emoji, message.id);
    };

    render() {
        const { channelName, messages} = this.state;
        return (
            <div className="channel-item">
                <CloseButton onClose={this.handleClose} />
                <div className="channel-detail">
                    {!this.state.isEditing ? (
                        <div className="display-channel-name">
                            <h3>
                                # <strong>{channelName}</strong>
                                <a onClick={this.toggleEdit}><span className="material-symbols-outlined md-18">edit</span></a>
                            </h3>
                        </div>
                    ) : (
                        <div className="edit-channel-name">
                            <h3>
                                Chatting in <input value={this.state.newChannelName} onChange={this.handleChannelNameChange} />
                                <button onClick={this.updateChannelName}>Update</button>
                            </h3>
                        </div>
                    )}
                </div>
                <div className="messages">
                    {messages.map(message => (<Message message={message} reply={true} openThread={() => { this.openThread(message)}} handleAddReaction={(emogi) => this.handleAddReaction(emogi, message)}/>))}
                </div>
                <Comment value={this.state.comment} handleChange={this.handleCommentChange} handleSubmit={this.postMessage}/>
            </div>
        );
    }
}

function getThreadContent(threadID) {
    if (threadID == 1) {
        return "thread11111";
    } else if (threadID == 2) {
        return "thread21111";
    } else if (threadID == 3) {
        return "thread311111";
    }
}

class Thread extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            messages: [],
            reactions: [],
            channelName: "",
        };
    }

    fetchThread = () => {
        let api_key = localStorage.getItem("qileichen_api_key");
        if (!api_key) {
          this.setState({ messages: [] });
          return;
        }
        getThread(this.props.channelId, this.props.threadId)
        .then(data => {
            this.setState({messages: data.messages, channelName: data.channelName});
        })
        .catch(error => {
                console.error('Failure to update the thread messages: ', error);
                this.props.setPath("/channel/" + this.props.channelId);
        })
    }

    componentDidMount() {
        this.fetchThread();
        this.intervalId = setInterval(this.fetchThread, UPDATE_FREQ);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    // Event handler for textarea changes
    handleCommentChange = (event) => {
        this.setState({ comment: event.target.value });
    }

    // Event handler for reply submission
    handleReply = () => {
        postThreadMessage(this.props.channelId, this.props.threadId, this.state.comment);
        this.setState({ comment: '' });
    }

    handleClose = () => {
        this.props.setPath("/channel/" + this.props.channelId);
    }

    handleAddReaction = (emoji, message) => {
        addRection(emoji, message.id);
    };

    render() {
        const threadId = this.props.threadId;
        const messages = this.state.messages;
        const channelName = this.state.channelName;

        return (
            <div className="thread">
                <CloseButton onClose={this.handleClose} />
                <div className="thread-detail">
                    <div className="display-thread-name">
                        <h3>
                            <strong>Thread</strong> # {channelName}
                        </h3>
                    </div>

                </div>
                <div className="messages">
                    {messages.map(message => (<Message message={message} reply={false} handleAddReaction={(emogi) => this.handleAddReaction(emogi, message)}/>))}
                </div>
                <Comment value={this.state.comment} handleChange={this.handleCommentChange} handleSubmit={this.handleReply}/>
            </div>
        );
    }
}

class Channel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            channelId: 0,
            threadId: 0,
        };
    }

    setCurrentChannel = (channelId) => {
        this.props.setPath("/channel/" + channelId);
        this.setState({ channelId: channelId });
    }

    setCurrentThread = (id) => {
        this.setState({ threadId: id })
    }

    componentDidMount() {
        this.setState({ channelId: this.props.channelId, threadId: this.props.threadId });
    }

    render() {
        let channelId = this.props.channelId;
        let threadId = this.props.threadId;

        return (
            <div className="channel">
                <Header
                    isLoggedIn={true}
                    setPath={this.props.setPath}
                    setLogin={this.props.setLogin}
                    setLogout={this.props.setLogout}
                    username={this.props.username}
                />
                <div className="clip">
                    <div className="container">
                        <div className={threadId == 0 ? "chat" : "chat channel-thread"}>
                            <ChannelList
                                channelId={channelId}
                                setCurrentChannel={(channelId) => this.setCurrentChannel(channelId)}
                                setPath={this.props.setPath}
                                setCurrentThread={(id) => this.setCurrentThread(id)}
                            />
                            {(channelId != 0) && <ChannelItem
                                channelId={channelId}
                                setPath={this.props.setPath}
                                setCurrentThread={(id) => this.setCurrentThread(id)}
                            />}
                            {(channelId != 0 && threadId != 0) && <Thread
                                channelId={channelId}
                                threadId={threadId}
                                setPath={this.props.setPath}
                                setCurrentThread={(id) => this.setCurrentThread(id)}
                            />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

///////////////////////////////////////////Belay///////////////////////////////////////////////
class Belay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            path: "/",
            username: "",
        };
    }

    setPath = (nextPath) => {
        history.pushState(null, null, nextPath);
        this.setState({ path: nextPath });
        console.log("push", nextPath);
    }

    setBackPath = (nextPath) => {
        this.setState({ path: nextPath });
    }

    setLogin = (name) => {
        this.setState({ isLoggedIn: true, username: name });
    }

    setLogout = () => {
        this.setState({ isLoggedIn: false, username: "" });
        localStorage.removeItem("qileichen_api_key");
        localStorage.removeItem("qileichen_username");

    }

    componentDidMount() {
        this.setPath(window.location.pathname);

        let apiKey = localStorage.getItem("qileichen_api_key");

        if (apiKey == null) {
            this.setLogout();
        } else {
            this.setLogin(localStorage.getItem("qileichen_username"));
        }

        window.addEventListener("popstate", () => {
            let path = window.location.pathname;
            this.setBackPath(path);
            console.log("pop", path);
        });
    }

    render() {
        const { isLoggedIn, path, username } = this.state;
        console.log("start component", path, isLoggedIn);
        if (path == "/") {
            return <Splash
                isLoggedIn={isLoggedIn}
                setPath={this.setPath}
                setLogin={this.setLogin}
                setLogout={this.setLogout}
                username={username}
            />
        } else if (!isLoggedIn) {
            if (path == "/login") {
                return <Login
                    setPath={this.setPath}
                    setLogin={this.setLogin}
                    setLogout={this.setLogout}
                />
            } else {
                localStorage.setItem("qileichen_temp_path", path);
                this.setPath("/login");
                return;
            }
        } else if (path == "/profile") {
            return <Profile
                setPath={this.setPath}
                setLogin={this.setLogin}
                setLogout={this.setLogout}
                username={username}
            />
        } else if (path.startsWith("/channel")) {
            let pathSegments = path.split('/');
            let channelId = 0;
            let threadId = 0;
            if (pathSegments.length > 2) {
                channelId = pathSegments[2];
            }
            if (pathSegments.length > 3) {
                threadId = pathSegments[3];
            }
            return <Channel
                channelId={channelId}
                threadId={threadId}
                setPath={this.setPath}
                setLogin={this.setLogin}
                setLogout={this.setLogout}
                username={username}
            />
        } else {
            history.pushState(null, null, "/");
            return <Splash
                isLoggedIn={isLoggedIn}
                setPath={this.setPath}
                setLogin={this.setLogin}
                setLogout={this.setLogout}
                username={username}
            />
        }

    }
}

const rootContainer = document.getElementById("root");
const root = ReactDOM.createRoot(rootContainer);
root.render(<Belay
/>);


///////////////////////////////////util/////////////////////////////////////
async function loginApi(username, password) {
    const loginPath = `/api/login`;
    return fetch(loginPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(({
            username: username,
            password: password,
        }))
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            } else {
                localStorage.setItem("qileichen_api_key", data.api_key);
                localStorage.setItem("qileichen_username", username);
            }
        })
}

async function signupApi() {
    const signUpPath = `/api/signup`;
    return fetch(signUpPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            } else {
                localStorage.setItem("qileichen_api_key", data.api_key);
                localStorage.setItem("qileichen_username", data.username);
            }
        })
}

async function updateUsername(newName) {
    const usernamePath = "/api/user/username";
    return fetch(usernamePath, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify({ name: newName })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                throw new Error(data.error);
            } else {
                localStorage.setItem("qileichen_username", newName);
            }
        })
}

async function updatePassword(newPassword) {
    const passwordPath = "/api/user/password";
    return fetch(passwordPath, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify({ password: newPassword })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
        })
        .catch(error => {
            console.error('Failure to update the password: ', error);
        })
}

async function createChannel() {
    const createChannelPath = "/api/channel/new";
    return fetch(createChannelPath, {
        method: 'POST',
        headers: {
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        });
}

async function getChannels() {
    const channelsPath = "/api/channels";
    return fetch(channelsPath, {
      method: 'GET',
      headers: {
          'Api-Key': localStorage.getItem("qileichen_api_key"),
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      } 
      return data;
    })
  }

async function getChannelItem(channelId) {
    const channelItemPath = `/api/channels/${channelId}`;
    return fetch(channelItemPath, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        } 
        return data;
    });
}

async function postCahnnelMessage(channelId, newPost) {
    const postMsgPath = `/api/channels/${channelId}`;
    return fetch(postMsgPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Api-Key": localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify(({
            body: newPost,
        }))
    })
    .then(response => {
        if (!response.ok) {
            console.error();
        }
    })
    .catch(error => {
        console.error('Failure to post the message: ', error);
    })
  }

async function getThread(channelId, threadId) {
    const threadPath = `/api/threads/${channelId}/${threadId}`;
    return fetch(threadPath, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        } 
        return data;
    });
}

async function postThreadMessage(channelId, threadId, newPost) {
    const postMsgPath = `/api/threads/${channelId}/${threadId}`;
    return fetch(postMsgPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Api-Key": localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify(({
            body: newPost,
        }))
    })
    .then(response => {
        if (!response.ok) {
            console.error();
        }
    })
    .catch(error => {
        console.error('Failure to post the message: ', error);
    })
  }

async function updateChannelName(channelId, newName) {
    const channelNamePath = `/api/channels/${channelId}/name`;
    return fetch(channelNamePath, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify({name: newName})
    })
    .then(response => response.json())
    .then(data => {
    if (data.error) {
        throw new Error(data.error);
    }})
    .catch(error => {
        console.error('Failure to update the room name:', error);
    });
}

// Add Reactions
async function addRection(emoji, threadId) {
    const postMsgPath = `/api/reactions/${threadId}`;
    return fetch(postMsgPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Api-Key": localStorage.getItem("qileichen_api_key"),
        },
        body: JSON.stringify(({
            body: emoji,
        }))
    })
    .then(response => {
        if (!response.ok) {
            console.error();
        }
    })
    .catch(error => {
        console.error('Failure to add the reaction: ', error);
    })
  }
