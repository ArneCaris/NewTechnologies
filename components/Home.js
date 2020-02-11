import React, {Component, useEffect, useState} from 'react';
import { Image, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, View, TextInput, Alert, ScrollView} from 'react-native';
import io from 'socket.io-client';

export default class Home extends Component {

    constructor() {
        super();
        this.state = {
            chats: [],
            messages: [],
            chatData: [],
            showWelcomeModal: false,
            showChangeNameModal: false,
            displayName: "",
            storedName: ""
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
        // const value = AsyncStorage.getItem('once');

        // if (value !== null) {
        //     value.then((ret) => {
        //     if (ret === null) {
        //         // this is the first time
        //         // show the modal
        //         // save the value

        //         AsyncStorage.setItem('once', 'bazinga');
        //         this.setState({
        //             showModal: true,
        //         });
        
        //     } else {
        //         // this is the second time
        //         // skip the modal
        
        //     }
        //     }).catch(err => alert(err.toString()));
        // }
        
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
                this.setState({chats: res.name[0].chats, showWelcomeModal: false}, () => console.log("86 socket loginRequestResponse: " + res.name[0].chats))
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
                } else {
                    console.log("something wrong with asyncstorage.")
                }
            }
                
        });
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
    

    // addMore() {
    //     if (this.state.displayNames.length !== 0) {
    //         let newArray = this.state.displayNames;
    //         let nameArray = [];
    //         for (var i = 0; i < newArray.length; i++) {
    //             nameArray.push(newArray[i].displayName)
    //             var index = nameArray.indexOf(this.state.storedName)
    //         }
    //         global.chatArray = this.state.displayNames[index].chats.map((data) => {
    //             fetch("http://newtechproject.ddns.net:4000/chats?chatName=" + data)
    //                 .then((response) => response.json())
    //                 .then((responseJson) => {
    //                     global.messageArray = responseJson[0].latestMessage
    //                     // console.log(global.messageArray)
                        
    //                 })
    //                 .catch((error) => {
    //                     console.error(error);
    //                 });
    //             console.log(global.messageArray)
    //             return(
    //                 <View key={data} style={styles.chatBar}>
    //                     <Text style={styles.name}>{data}</Text>
    //                     <Text style={styles.message}>{global.messageArray}</Text>
    //                 </View>
    //             )
    //         })
    //     }
        
    // }

    // addName() {
    //     if (this.state.displayName.length <= 2) {
    //         Alert.alert('Oops too short!',"Your display name needs to have at least 3 characters.")
    //     } else {
    //         fetch("http://newtechproject.ddns.net:4000/displaynames", {
    //             method: 'POST',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ displayName: this.state.displayName })
    //         }).then(function(response) {
    //             return response;
    //         }).catch(function(error) {
    //             console.log("error " + error.message);
    //             throw error;
    //         })
    //         this.setState({ showModal: false  }); 
    //         AsyncStorage.setItem('name', this.state.displayName)  
    //         this.componentDidMount();
    //     }
        
    // }

    render() {

            // console.log(this.state.chatData)
            // this.addMore();
            
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



{/* Main APP windows with chats */}
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button styel={styles.addbutton} title="Change Name" onPress={() => this.setState({ showChangeNameModal: true, displayName: '' })}></Button>
                </View>
                

                {/* <ScrollView style={styles.scrollContainer}>
                    
                    {chatArray}

                </ScrollView> */}

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
