import React, {Component} from 'react';
import { Modal, Button, TouchableOpacity, YellowBox, Text, View, TextInput, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import io from 'socket.io-client';
import styles from './styleHome';


export default class Home extends Component {
    constructor() {
        super();
        this.state = {
            chats: [],
            messages: [{message: "no messages..."}],
            chatData: [],
            sortedChats: [],
            showWelcomeModal: false,
            showChangeNameModal: false,
            showChatModal: false,
            displayName: "",
            storedName: "",
            chat: "",
            message: ''
        }

        this.submitNameRequest = this.submitNameRequest.bind(this);
        this.changeNameRequest = this.changeNameRequest.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.profanityCheck = this.profanityCheck.bind(this);

        this.ENDPOINT = 'http://newtechproject.ddns.net:5000/'
        this.ENDPOINT_HTTPS = 'https://newtechproject.ddns.net:5001/';

        this.socket = ''
    }


  

    componentDidMount() {
        
        YellowBox.ignoreWarnings(
            ['Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'],
            ["Warning: AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-community/async-storage' instead of 'react-native'. See https://github.com/react-native-community/react-native-async-storage"],
            
        );

        var name = AsyncStorage.getItem('name');

        // socket setup starts here
        this.socket = io(this.ENDPOINT, { transports: ['websocket'], rejectUnauthorized: false });

        // HTTPS not ready
        // this.socket = io(this.ENDPOINT_HTTPS);


        //login & varification
        if (name !== null) {
            name.then((ret) => {
                // console.log("AsyncStroge name: "+ ret)
                if (ret !== null) {
                    this.setState({ storedName: ret }, () => this.socket.emit('loginRequest', {displayName: this.state.storedName}))
                } else {
                    this.setState({ showWelcomeModal: true })//, () => console.log("62 showing the WELCOME modal."))
                }

            }).catch(err => alert(err.toString()));
        } else {
            console.log("67 name from async strage is NULL");
        }


        
        // logging in
        this.socket.on("loginRequestResponse", res => {
            if (res.response === false) {
                this.setState({showWelcomeModal: true});             
               
            } else {
                this.setState({chats: res.name[0].chats, showWelcomeModal: false})
                this.socket.emit('chatRequest', {displayName: this.state.storedName, chats: res.name[0].chats})
            }
        });

        // registering new name
        this.socket.on('submitNameRequestResponse', res => {
            console.log("91 submitNameRequestResponse", "res: ", res);
                if (res.response === false) {
                    Alert.alert(
                        'Sorry, name not claimed.',
                        res.reason,
                        [
                            {text: 'OK', onPress: () => {console.log('Retry OK Pressed')}},
                        ],
                        {cancelable: false},
                      );
                } else {
                    let setName = AsyncStorage.setItem('name', this.state.displayName );
                    if (setName !== null) {
                        setName.then(ret => {this.setState({storedName: res.name[0].displayName, chats: res.name[0].chats, showWelcomeModal: false}) });
                        this.socket.emit('chatRequest', {displayName: res.name[0].displayName, chats: res.name[0].chats})
                    } else {
                        console.log("101 something wrong with asyncstorage.")
                    }
             
                }
        })

        // asking for name change
        this.socket.on('changeNameRequestResponse', (res) => {
            console.log("101 changeNameRequestResponse", "res: ", res)
            if (res.response === false) {
                Alert.alert(
                    'Sorry, name not claimed.',
                    res.reason,
                    [
                        {text: 'OK', onPress: () => {console.log('Retry OK Pressed')}},
                    ],
                    {cancelable: false},
                    );
            } else {
                let setName = AsyncStorage.setItem('name', this.state.displayName );
                if (setName !== null) {
                    setName.then(this.setState({storedName: res.name[0].displayName, chats: res.name[0].chats, showChangeNameModal: false}));
                    this.socket.emit('chatRequest', {displayName: res.name[0].displayName, chats: res.name[0].chats})

                } else {
                    console.log("126 something wrong with asyncstorage.")
                }
            }
                
        });

        // recieve chats and latest messages
        this.socket.on('chatRequestResponse', (res) => {
            console.log("chatRequestResponse triggered")//, res)
            if(res.chats.length != 0) {
                let sortedChats = [];
                res.chats.map( //data => console.log(data)
                (latestMessage, i) => {
                        sortedChats.push(latestMessage[latestMessage.length -1])
                })
                sortedChats.sort((a, b) => {
                    return new Date(b.timeStamp) - new Date(a.timeStamp)

                });
                console.log("this is sortedChats: ",sortedChats);
                this.setState({chatData: res.chats , sortedChats}) //console.log("146 map from socket: " + this.state.chatData[i][0].chat)

            } else {
                console.trace("149 ERROR retrieving the chats!!!!")
            }
        })
    }

    // name profanity check
    profanityCheck() {    
        const bigNONO = ["fuck", "nigger", "nigga", "racist", "pussy", "penis", "rape", "vagina", "admin", "shit", "chatapp" ]

        let ogName = this.state.displayName;
        let nameToTest = ogName.trim().toLowerCase();

        return new Promise((resolve, reject) => {
            for(let i = 0; i < bigNONO.length; i++) {
                if(nameToTest.includes(bigNONO[i])) {
                    Alert.alert(
                        'Warning',
                        `${ogName} not allowed as a Display Name`,
                        [
                            {text: 'OK', onPress: () => {console.log('Warning OK Pressed'); this.setState({displayName: ''})}},
                        ],
                        {cancelable: false},
                        );
                    reject(false).catch((err) => {throw err})
                }
    
            }
            resolve(true)
        })     
    }

    // function to register/claim a name
    submitNameRequest() {
        const check = this.profanityCheck();
        check.then((result) => {
            if (result) {
                this.socket.emit('submitNameRequest', { displayName : this.state.displayName})
            }
        }).catch((err) => console.log("190 promise error", err))
    }

    // function to change a name
    changeNameRequest() {
        const check = this.profanityCheck();
        check.then((result) => {
            if (result) {
                this.socket.emit('changeNameRequest', {newDisplayName : this.state.displayName, oldDisplayName : this.state.storedName})
            }
        }).catch((err) => console.log("200 promise error", err))
    }

    // messaging
    sendMessage() {
        console.log("this is message in state:",this.state.message,"this is if it is !==", this.state.message !== '')
        if (this.state.message !== ''){
            this.socket.emit('sendMessage', {displayName: this.state.storedName, chat: this.state.chat, message: this.state.message, chats: this.state.chats})
            this.setState({message: ''})
        } else {
            return
        }

    }
    
    // rendering UI
    showChats() {
        global.chatArray= []
        if (this.state.chatData.length !== 0) {
                        
            global.chatArray = this.state.sortedChats.map((latestMessage, i) => {

                function addZero(i) {
                    if (i < 10) {
                      i = "0" + i;
                    }
                    return i;
                  }

                let d = new Date(latestMessage.timeStamp)
            
                const date = d.getDate()
                const month = d.getMonth() + 1
                const year = d.getFullYear()
                const hours = addZero(d.getHours())
                const minutes = addZero(d.getMinutes())
                let time = '';

                if(d === NaN || d === null) {
                    time = ''
                } else {
                    time = hours + ":" + minutes + "   |   " + date + "/" + month + "/" + year;
                }

                let FPMessage = latestMessage.message

                if(FPMessage.length > 40) {
                    FPMessage = FPMessage.substring(0, 40) + "..."
                }

                const random = Math.random() * -9999999999 + 9999999999;

                return(
                    <TouchableOpacity key={random + latestMessage.chat + i} style={styles.chatBarHome} onPress={() => this.setState({chat: latestMessage.chat, showChatModal : true})}>
                        <Text style={styles.name} >{latestMessage.chat}</Text>
                        <Text style={styles.messageChat}>{FPMessage}</Text>
                        <Text style={styles.timeStamp}>{time}</Text>
                    </TouchableOpacity>
                )

            })
        }
        
    }

    // displaying messages in open chat
    showMessages() {
        global.messageArray= []
        if (this.state.chatData.length !== 0) {
            global.messageArray = this.state.chatData.map((data, i) => {
                return data.map(chat => {

                    function addZero(i) {
                        if (i < 10) {
                          i = "0" + i;
                        }
                        return i;
                      }

                    let d = new Date(chat.timeStamp)
                
                    const date = d.getDate()
                    const month = d.getMonth() + 1
                    const year = d.getFullYear()
                    const hours = addZero(d.getHours())
                    const minutes = addZero(d.getMinutes())
                    let time = '';
                    // console.log("d=="+ d)
                    if(d === NaN || d === null) {
                        time = ''
                    } else {
                        time = hours + ":" + minutes + "   |   " + date + "/" + month + "/" + year;
                    }

                    const random = Math.random() * -9999999999 + 9999999999;
                
                    if (chat.chat === this.state.chat) {
                        return(
                            <View key={chat.displayName + chat.message + random} style={styles.chatBar} >
                                <Text style={styles.messageName} >{chat.displayName}</Text>
                                <Text style={styles.messageChat}>{chat.message}</Text>
                                <Text style={styles.timeStamp}>{time}</Text>
                            </View>
                        )
    
                    }
                        
                })
                
            })
                
        }
        
    }

    //  actual UI
    render() {

            this.showChats()
            this.showMessages()
                       
            
            return (
            <View style={styles.container}>

{/* WELCOME login modal */}
                <Modal visible={this.state.showWelcomeModal} animationType="slide">
                    <View style={styles.explanationText}>
                        <Text style={styles.title}>Welcome to ChatApp!</Text>
                        <TextInput
                            accessibilityLabel={'loginInput'}
                            style={styles.TextInput}
                            placeholder="username                                             "
                            maxLength={15}
                            ref="displayName"
                            value={this.state.displayName}
                            onSubmitEditing={() => this.submitNameRequest()}
                            onChangeText={(displayName) => this.setState({ displayName }, () => console.log(displayName))}
                            value={this.state.displayName}
                        />
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
                        <View style={styles.modalButton}>
                            <Button accessibilityLabel={'loginButton'} title="Let's go!" size={100} color="#a11485" onPress={() => this.submitNameRequest() }/>
                        </View>
                    </View>
                </Modal>

{/* CHANGE NAME while logged in modal */}
                <Modal visible={this.state.showChangeNameModal} animationType="slide" onRequestClose={() => this.setState({ showChangeNameModal: false })}>
                    <View style={styles.explanationText}>
                        <TouchableOpacity onPress={() => this.setState({ showChangeNameModal: false })}>
                                <Text style={styles.backBtn} size={500} color="#a11485" onPress={() => this.setState({ showChangeNameModal: false })}>
                                &#171;
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>TRY YOUR LUCK</Text>
                        <TextInput
                            style={styles.TextInput}
                            placeholder="username                                             "
                            maxLength={15}
                            ref="displayName"
                            value={this.state.displayName}
                            onSubmitEditing={() => this.changeNameRequest()}
                            onChangeText={(displayName) => this.setState({ displayName }, () => console.log(this.state.displayName))}
                            value={this.state.displayName}
                        />
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.changeNameRequest() }/>
                        </View>
                    </View>
                </Modal>


{/* OPEN CHAT modal */}
                <Modal visible={this.state.showChatModal} animationType="slide"  onRequestClose={() => this.setState({ showChatModal: false })}>
                    <View style={styles.chatTitleContainter}>
                        <TouchableOpacity onPress={() => this.setState({ showChatModal: false })}>
                            <Text style={styles.backBtn} size={500} color="#a11485" onPress={() => this.setState({ showChatModal: false })}>
                                &#171;
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.titleChat}>{this.state.chat}</Text>

                    </View>

                    <View style={styles.scrollContainer}>
                        <ScrollView 
                            ref={ref => this.scrollView = ref}
                            onContentSizeChange={(contentWidth, contentHeight)=>{        
                                this.scrollView.scrollToEnd({animated: true});
                            }}
                        >
                            {messageArray}
                        </ScrollView>
                    </View>

                    <View style={styles.sendMessageContainer}>
                        <TextInput 
                            style={styles.messageInput}
                            placeholder="type here...."
                            ref="displayName"
                            value={this.state.message}
                            onPress={() =>  this.scrollView.scrollToEnd({ animated: true })}
                            onSubmitEditing={() => this.sendMessage()}
                            onChangeText={(message) => this.setState({ message }, () => console.log(this.state.message))}
                        ></TextInput>
                        <TouchableOpacity onPress={() => this.sendMessage()}>
                            <Text style={styles.addButton}> {">"} </Text>
                        </TouchableOpacity>
                    </View>
                </Modal>


{/* Main APP windows with chats */}
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button style={styles.addbutton} title="Change Name" onPress={() => this.setState({ showChangeNameModal: true, displayName: '' })}></Button>
                </View>
                

                <ScrollView style={styles.scrollContainer}>
                    
                    {chatArray}

                </ScrollView>

            </View>
            );  
    }
}
