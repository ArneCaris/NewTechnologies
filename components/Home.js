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
            displayNames: [],
            chatData: [],
            showModal: true,
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
        // fetch("http://newtechproject.ddns.net:4000/chats")
        //     .then((response) => response.json())
        //     .then((responseJson) => {
        //         this.setState({ chats: responseJson }, () => console.log("."))
        //     })
        //     .catch((error) => {
        //     console.error(error);
        //     });
        // fetch("http://newtechproject.ddns.net:4000/messages")
        //     .then((response) => response.json())
        //     .then((responseJson) => {
        //         this.setState({ messages: responseJson }, () => console.log(".."))
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
        // fetch("http://newtechproject.ddns.net:4000/displaynames")
        //     .then((response) => response.json())
        //     .then((responseJson) => {
        //         this.setState({ displayNames: responseJson }, () => console.log("..."))
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });

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
            console.log("name from async storage is NOT NULL")
            name.then((ret) => {
                console.log(ret)
                this.setState({ storedName: ret }, () => this.socket.emit('loginRequestBackEND', {displayName: this.state.storedName}))

            }).catch(err => alert(err.toString()));
        } else {
            console.log("name from async strage is NILL");
        }


        // socket stuff starts here
        this.socket = io(this.ENDPOINT);

        

        // this socket for auto login after user selected a name
        this.socket.on('loginRequestClient', (res, err) => {
            
            if( res.length === 0 ) {
                this.setState({showModal: true})
            } else {
                console.log("loginRequestClient socket: "+ res.displayName)
                // this.setState({showModal: false, chats: res.displayName.chats})
            }
            // if(err) {
            //     console.log(err.toString())
            // } else {
            //     this.setState({chats: res.displayName[0].chats, showModal: false}, () => {                    
            //         console.log("(loginRequestClient) STATE: "+ this.state.chats)
            //     });
            // }

        })


        //nameRequestResponse
        // this socket for name change
        // this.socket.on("changeNameRequestResponse", response => {
        //     if (response !== null) {
        //         console.log("socket changeNameRequestResponse: " + response)
        //     }
        // });


        this.socket.on('changeNameRequestResponse', (res) => {
            console.log(res.response)
            if (res.response == "Internal Error" && res.response == 'Booked' ) {
                () => alert(res.response)
                console.log(res)
            } else if (res.response === "Reused" && res.response === "New") {
                async () => await AsyncStorage.setItem('name', newDisplayName ), () => alert(`${newDisplayName} has been claimed by YOU.`);
                console.log(res)
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

    // disconnectFromSocket () {
    //     return () => {
    //         socket.emit('disconnect');
      
    //         socket.off();
    //       }
    // }


    // displayNameRequest
    submitNameRequest() {
        this.socket.emit('displayNameRequest', { displayName : this.state.displayName});
    }

    changeNameRequest() {
        this.socket.emit('changeNameRequest', {newDisplayName : this.state.displayName, oldDisplayName : this.state.storedName});
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


        if (this.state.chats.length !== 0 && this.state.messages.length !== 0 && this.state.displayNames.length !== 0) {

            // console.log(this.state.chatData)
            // this.addMore();
            
            return (
            <View style={styles.container}>

                <Modal visible={this.state.showModal} animationType="slide">
                    <View style={styles.explanationText}>
                        <Text style={styles.title}>Welcome to ChatApp!</Text>
                        <Text style={styles.text}>Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that someone else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
                        <TextInput
                            style={styles.TextInput}
                            placeholder="username                                             "
                            maxLength={15}
                            ref="displayName"
                            onChangeText={(displayName) => this.setState({ displayName: displayName }, () => console.log(this.state.displayName))}
                            vale={this.state.displayName}
                        />
                        <View style={styles.modalButton}>
                        <Button title="Let's go!" size={100} color="#a11485" onPress={() => { this.setState({ showModal: true }); this.addName(); }}/>
                        </View>
                    </View>
                </Modal>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button styel={styles.addbutton} title="Modal" onPress={() => this.setState({ showModal: true })}></Button>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    
                    {chatArray}

                </ScrollView>

            </View>
            );
        } else {
            return(
                // <Text>Loading ..</Text>


            <View style={styles.container}>

                <Modal visible={this.state.showModal} animationType="slide">
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
                            onSubmitEditing={() => this.changeNameRequest()}
                            onChangeText={(displayName) => this.setState({ displayName }, () => console.log(this.state.displayName))}
                            vale={this.state.displayName}
                        />
                        <View style={styles.modalButton}>
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.changeNameRequest() }/>
                        </View>
                    </View>
                </Modal>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button styel={styles.addbutton} title="Modal" onPress={() => this.setState({ showModal: true })}></Button>
                </View>
                </View>
            )
        }
        
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
