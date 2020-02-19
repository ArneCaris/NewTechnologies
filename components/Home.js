import React, {Component} from 'react';
import { Modal, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { YellowBox, Text, View, TextInput, Alert, ScrollView} from 'react-native';
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

        this.ENDPOINT = 'http://newtechproject.ddns.net:5000/'
        this.ENDPOINT_HTTPS = 'https://newtechproject.ddns.net:5001/';

        this.socket = ''
    }


  

    componentDidMount() {
        
        YellowBox.ignoreWarnings([
            'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
        ]);

        var name = AsyncStorage.getItem('name');

        // socket stuff starts here
        this.socket = io(this.ENDPOINT);
        // this.socket = io(this.ENDPOINT_HTTPS);

        if (name !== null) {
            name.then((ret) => {
                console.log("AsyncStroge name: "+ ret)
                if (ret !== null) {
                    this.setState({ storedName: ret }, () => this.socket.emit('loginRequest', {displayName: this.state.storedName}))
                } else {
                    this.setState({ showWelcomeModal: true }, () => console.log("showing the WELCOME modal."))
                }

            }).catch(err => alert(err.toString()));
        } else {
            console.log("name from async strage is NULL");
        }


        
        // this socket for name change
        this.socket.on("loginRequestResponse", res => {

            if (res.response === false) {
                this.setState({showWelcomeModal: true});             
               
            } else {
                this.setState({chats: res.name[0].chats, showWelcomeModal: false})
                this.socket.emit('chatRequest', {displayName: this.state.storedName, chats: res.name[0].chats})
            }
        });

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
                        console.log("107 something wrong with asyncstorage.")
                    }
             
                }
        })


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
                    console.log("118 something wrong with asyncstorage.")
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




                this.setState({chatData: res.chats , sortedChats}) //console.log("129 map from socket: " + this.state.chatData[i][0].chat)

            } else {
                console.trace("132 ERROR retrieving the chats!!!!")
            }
        })

    }

    // displayNameRequest
    submitNameRequest() {
        this.socket.emit('submitNameRequest', { displayName : this.state.displayName})
    }

    changeNameRequest() {
        this.socket.emit('changeNameRequest', {newDisplayName : this.state.displayName, oldDisplayName : this.state.storedName})
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

                let fo = Math.random() * -9999999999999 + 99999999999999;

                return(
                    <TouchableOpacity key={fo + latestMessage.chat + i} style={styles.chatBar} onPress={() => this.setState({chat: latestMessage.chat, showChatModal : true})}>
                        <Text style={styles.name} >{latestMessage.chat}</Text>
                        <Text style={styles.message}>{latestMessage.message}</Text>
                    </TouchableOpacity>
                )

            })
        }
        
    }




    showMessages() {
        global.messageArray= []
        if (this.state.chatData.length !== 0) {
            global.messageArray = this.state.chatData.map((data, i) => {
                return data.map(chat => {
                    // console.log("logging data",chat.chat, this.state.chat, chat.chat === this.state.chat)

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
                                <Text style={styles.name} >{chat.displayName}</Text>
                                <Text style={styles.message}>{chat.message}</Text>
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
                            style={styles.TextInput}
                            placeholder="username                                             "
                            maxLength={15}
                            ref="displayName"
                            value={this.state.displayName}
                            onSubmitEditing={() => this.submitNameRequest()}
                            onChangeText={(displayName) => this.setState({ displayName }, () => console.log(this.state.displayName))}
                            vale={this.state.displayName}
                        />
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.submitNameRequest() }/>
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
                    <View style={styles.chatTitle}>
                        <TouchableOpacity onPress={() => this.setState({ showChatModal: false })}>
                            <Text style={styles.backBtn} size={500} color="#a11485" onPress={() => this.setState({ showChatModal: false })}>
                            &#171;
                        </Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{this.state.chat}</Text>

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
                            vale={this.state.message}
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
