import React, {Component, useEffect, useState} from 'react';
import { Image, Modal, Button, TouchableOpacity, BackHandler } from 'react-native';
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
            showWelcomeModal: false,
            showChangeNameModal: false,
            showChatModal: false,
            displayName: "",
            storedName: "",
            chat: "",
        }

        this.submitNameRequest = this.submitNameRequest.bind(this);
        this.changeNameRequest = this.changeNameRequest.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

        this.ENDPOINT = 'http://newtechproject.ddns.net:5000/';

        this.socket = ''
    }


  

    componentDidMount() {
        
        YellowBox.ignoreWarnings([
            'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
        ]);

        var name = AsyncStorage.getItem('name');

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


        // socket stuff starts here
        this.socket = io(this.ENDPOINT);

        
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

                this.setState({chatData: res.chats}) //console.log("129 map from socket: " + this.state.chatData[i][0].chat)

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
        this.socket.emit('sendMessage', {displayName: this.state.storedName, chat: this.state.chat, message: this.state.message, chats: this.state.chats})
        this.setState({message: ''})

    }
    
    // rendering UI
    showChats() {
        global.chatArray= []
        if (this.state.chatData.length !== 0) {
            global.chatArray = this.state.chatData.map((latestMessage, i) => {
                // console.log("show chats, latestMessage: ", latestMessage)


                return(
                    <TouchableOpacity key={latestMessage[0].chat + i} style={styles.chatBar} onPress={() => this.setState({chat: latestMessage[latestMessage.length - 1].chat, showChatModal : true})}>
                        <Text style={styles.name} >{latestMessage[latestMessage.length - 1].chat}</Text>
                        <Text style={styles.message}>{latestMessage[latestMessage.length - 1].message}</Text>
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

                    // let d = new Date(chat.timeStamp)
                
                    // const date = d.getDate()
                    // const month = d.getMonth() + 1
                    // const year = d.getFullYear()
                    // const hours = d.getHours()
                    // const minutes = d.getMinutes()
                    // let time = '';
                    // // console.log("d=="+ d)
                    // if(d === NaN || d === null) {
                    //     time = ''
                    // } else {
                    //     time = hours + ":" + minutes + " " + date + "/" + month + "/" + year;
                    // }

                    const random = Math.random() * -9999999999 + 9999999999;
                
                    if (chat.chat === this.state.chat) {
                        return(
                            <View key={chat.displayName+ chat.message + random} style={styles.chatBar} >
                                <Text style={styles.name} >{chat.displayName}</Text>
                                <Text style={styles.message}>{chat.message}</Text>
                                {/* <Text>{time}</Text> */}
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
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
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
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.submitNameRequest() }/>
                        </View>
                    </View>
                </Modal>

{/* CHANGE NAME while logged in modal */}
                <Modal visible={this.state.showChangeNameModal} animationType="slide" onRequestClose={() => this.setState({ showChangeNameModal: false })}>
                    <View style={styles.explanationText}>
                        <Text style={styles.title}>TRY YOUR LUCK</Text>
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
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
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.changeNameRequest() }/>
                            <Button title="Nah, go back." size={100} color="#a11485" onPress={() => this.setState({ showChangeNameModal: false, displayName: this.state.storedName })} />
                        </View>
                    </View>
                </Modal>


{/* OPEN CHAT modal */}
                <Modal visible={this.state.showChatModal} animationType="slide"  onRequestClose={() => this.setState({ showChatModal: false })}>
                    <View style={styles.explanationText}>
                    <Button title="Nah, go back." size={100} color="#a11485" onPress={() => this.setState({ showChatModal: false })} />

                        <Text style={styles.title}>{this.state.chat}</Text>

                     
                    </View>

                    <ScrollView 
                        style={styles.scrollContainer}
                        ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight)=>{        
                            this.scrollView.scrollToEnd({animated: true});
                        }}
                    >
                        {messageArray}
                    </ScrollView>

                    <View>
                        <TextInput 
                            placeholder="type here...."
                            ref="displayName"
                            value={this.state.message}
                            onSubmitEditing={() => this.sendMessage()}
                            onChangeText={(message) => this.setState({ message }, () => console.log(this.state.message))}
                            vale={this.state.message}
                        ></TextInput>
                        <Button styel={styles.addbutton} title=">" onPress={() => this.sendMessage() }></Button>

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
