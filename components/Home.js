import React, {Component, useEffect, useState} from 'react';
import { Image, Modal, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView} from 'react-native';
import io from 'socket.io-client';

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
            chat: ""
        }
        // this.addName = this.addName.bind(this);
        // this.addMore = this.addMore.bind(this);
        this.connectToSocket = this.connectToSocket.bind(this);
        this.submitNameRequest = this.submitNameRequest.bind(this);
        this.changeNameRequest = this.changeNameRequest.bind(this);

        this.ENDPOINT = 'http://newtechproject.ddns.net:5000/';

        this.socket = ''
    }


  

    componentDidMount() {

        var name = AsyncStorage.getItem('name');

        if (name !== null) {
            // console.log("name from async storage is NOT NULL")
            name.then((ret) => {
                console.log("AsyncStroge name: "+ ret)
                if (ret !== null) {
                    this.setState({ storedName: ret }, () => this.socket.emit('loginRequest', {displayName: this.state.storedName}))
                } else {
                    this.setState({ showWelcomeModal: true }, () => console.log("showing the WELCOME modal."))
                }

            }).catch(err => alert(err.toString()));
        } else {
            console.log("name from async strage is NILL");
        }


        // socket stuff starts here
        this.socket = io(this.ENDPOINT);

        
        // this socket for name change
        this.socket.on("loginRequestResponse", res => {

            if (res.response === false) {
                this.setState({showWelcomeModal: true});             
               
            } else {
                this.setState({chats: res.name[0].chats, showWelcomeModal: false})
                this.socket.emit('chatRequest', {chats: res.name[0].chats})
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
                        this.socket.emit('chatRequest', {chats: res.name[0].chats})
                    } else {
                        console.log("107 something wrong with asyncstorage.")
                    }
             
                }
        })


        this.socket.on('changeNameRequestResponse', (res) => {
            console.log("114 changeNameRequestResponse", "res: ", res)
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
                    this.socket.emit('chatRequest', {chats: res.name[0].chats})

                } else {
                    console.log("something wrong with asyncstorage.")
                }
            }
                
        });

        // recieve chats and latest messages
        this.socket.on('chatRequestResponse', (res) => {
            if(res.length != 0) {
                this.setState({chatData: res.chats}, () => console.log("123 recieving chats from socket" + res.chats))
            } else {
                console.log("122 ERROR retrieving the chats!!!!")
            }
        })

        this.socket.on('getMessagesRequestResponse', (res) => {
            if(res.length != 0) {
                this.setState({messages: res.response}, () => console.log(this.state.messages))
                console.log("this is messages state: " + this.state.messages[0].message)
            } else {
                console.log('133 no messages')
            }
        })

    }

        
    //Join user to the chat he wants to join
    connectToSocket() {

    
        // this.socket.emit('join', () => {
    
        // });

        //Recieve messages as soon as user send it
        this.socket.on('message', (message) => {
            this.setState([...messages, message])
        });   

    }


    // displayNameRequest
    submitNameRequest() {
        this.socket.emit('submitNameRequest', { displayName : this.state.displayName})
    }

    changeNameRequest() {
        this.socket.emit('changeNameRequest', {newDisplayName : this.state.displayName, oldDisplayName : this.state.storedName})
    }
    

    showChats() {
        global.chatArray= []
        let index = -1;
        if (this.state.chatData.length !== 0) {
            global.chatArray = this.state.chatData.map((data, i) => {
                // index++;
                // console.log(index, i)
                return(
                    <TouchableOpacity key={data} style={styles.chatBar} onPress={() => this.setState({showChatModal : true, chat: this.state.chatData[i].chat}, () => {
                        this.socket.emit('getMessagesRequest', {chat : this.state.chat});
                    })}>
                        <Text style={styles.name} >{data.chat}</Text>
                        <Text style={styles.message}>{data.message}</Text>
                    </TouchableOpacity>
                )

            })
        }
        
    }
    showMessages() {
        global.chatArray= []
        let index = -1;
        if (this.state.chatData.length !== 0) {
            global.chatArray = this.state.chatData.map((data, i) => {
                // index++;
                // console.log(index, i)
                return(
                    <TouchableOpacity key={data} style={styles.chatBar} onPress={() => this.setState({showChatModal : true, chat: this.state.chatData[i].chat}, () => {
                        this.socket.emit('getMessagesRequest', {chat : this.state.chat});
                    })}>
                        <Text style={styles.name} >{data.chat}</Text>
                        <Text style={styles.message}>{data.message}</Text>
                    </TouchableOpacity>
                )

            })
        }
        
    }

    render() {

            this.showChats();
            
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
                <Modal visible={this.state.showChangeNameModal} animationType="slide">
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
                            vale={this.state.displayName}
                        />
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.changeNameRequest() }/>
                            <Button title="Nah, go back." size={100} color="#a11485" onPress={() => this.setState({ showChangeNameModal: false, displayName: this.state.storedName })} />
                        </View>
                    </View>
                </Modal>


{/* OPEN CHAT modal */}
<Modal visible={this.state.showChatModal} animationType="slide">
                    <View style={styles.explanationText}>

                        {/* <Text style={styles.title}>Chat Modal</Text> */}

                        <Text style={styles.title}>{this.state.messages[0].message}</Text>

                        {/* <Text style={styles.title}>{this.state.chat}</Text> */}
                        <View>
                        <Button title="Nah, go back." size={100} color="#a11485" onPress={() => this.setState({ showChatModal: false })} />
                        </View>
                    </View>
                </Modal>


{/* Main APP windows with chats */}
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button styel={styles.addbutton} title="Change Name" onPress={() => this.setState({ showChangeNameModal: true, displayName: '' })}></Button>
                </View>
                

                <ScrollView style={styles.scrollContainer}>
                    
                    {chatArray}

                </ScrollView>

            </View>
            );  
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#a11485',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    explanationText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10, 
    },
    headerText: {
        color: 'white',
        fontSize: 22,
        padding: 26,
        fontWeight: 'bold',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 10,
    },
    modalButton: {
        position: 'absolute',
        margin: 16,
        right: 10,
        bottom: 10,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 500,
    },
    chatBar: {
        height: 85,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    name: {
        left: 75,
        top: 14,
        fontWeight: 'bold',
    },
    message: {
        left: 75,
        top: 22,
    },
    title: {
        marginTop: -300,
        fontSize: 30,
        color: "#a11485",
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    text: {
        top: 100,
        fontSize: 15,
        alignSelf: 'center',
        textAlign: 'center',
    },
    noteMsg: {
        top: 100,
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    TextInput: {
        top: 180,
        marginBottom: 50,
        borderRadius: 2,
        borderWidth: 1.1,
        borderColor: '#a11485',
        marginTop: 50,
    }

    
});
