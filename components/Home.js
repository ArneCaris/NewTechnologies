import React, {Component} from 'react';
import { Image, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform, StyleSheet, Text, View, TextInput, Alert, ScrollView} from 'react-native';

export default class Home extends Component {

    constructor() {
        super();
        this.state = {
            chats: [],
            messages: [],
            displayNames: [],
            chatData: [],
            showModal: false,
            displayName: "",
            storedName: ""
        }
        this.addName = this.addName.bind(this);
        this.addMore = this.addMore.bind(this);
    }

    componentDidMount() {
        fetch("http://newtechproject.ddns.net:4000/chats")
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ chats: responseJson }, () => console.log("."))
            })
            .catch((error) => {
            console.error(error);
            });
        fetch("http://newtechproject.ddns.net:4000/messages")
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ messages: responseJson }, () => console.log(".."))
            })
            .catch((error) => {
                console.error(error);
            });
        fetch("http://newtechproject.ddns.net:4000/displaynames")
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ displayNames: responseJson }, () => console.log("..."))
            })
            .catch((error) => {
                console.error(error);
            });

        const value = AsyncStorage.getItem('once');

        if (value !== null) {
            value.then((ret) => {
            if (ret === null) {
                // this is the first time
                // show the modal
                // save the value

                AsyncStorage.setItem('once', 'bazinga');
                this.setState({
                    showModal: true,
                });
        
            } else {
                // this is the second time
                // skip the modal
        
            }
            }).catch(err => alert(err.toString()));
        }
        
        var name = AsyncStorage.getItem('name');

        if (name !== null) {
            name.then((ret) => {
            if (ret === null) {
                // this is the first time
                // save the name

                AsyncStorage.setItem('name', this.state.displayName);
        
            } else {
                // this is the second time
                // skip the modal
                name = AsyncStorage.getItem('name');
                name.then((e) => {
                    this.setState({ storedName: e })
                })
            }
            }).catch(err => alert(err.toString()));
        }
        
    }

    addMore() {
        let newArray = this.state.displayNames;
        let nameArray = [];
        for (var i = 0; i < newArray.length; i++) {
            nameArray.push(newArray[i].displayName)
            var index = nameArray.indexOf(this.state.storedName)
        }
        let chatArray = this.state.displayNames[index].chats.map((data) => {
            return(
                <View style={styles.chatBar}>
                    <Text style={styles.name}>{this.state.messages[this.state.messages.length-1].chat}</Text>
                    <Text style={styles.message}>{this.state.messages[this.state.messages.length-1].message}</Text>
                </View>
            )
        })
    }

    addName() {
        if (this.state.displayName.length <= 2) {
            Alert.alert('Oops too short!',"Your display name needs to have at least 3 characters.")
        } else {
            fetch("http://newtechproject.ddns.net:4000/displaynames", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ displayName: this.state.displayName })
            }).then(function(response) {
                return response;
            }).catch(function(error) {
                console.log("error " + error.message);
                throw error;
            })
            this.setState({ showModal: false  }); 
            AsyncStorage.setItem('name', this.state.displayName)  
            this.componentDidMount();
        }
        
    }

    render() {


        if (this.state.chats.length !== 0 && this.state.messages.length !== 0 && this.state.displayNames.length !== 0) {

            let newArray = this.state.displayNames;
            let nameArray = [];
            let latestMessage = "";
            for (var i = 0; i < newArray.length; i++) {
                nameArray.push(newArray[i].displayName)
                var index = nameArray.indexOf(this.state.storedName)
            }
            console.log(this.state.chats)
            let chatArray = this.state.displayNames[index].chats.map((data) => {
                console.log(data)
                fetch("http://newtechproject.ddns.net:4000/messages?chat=" + data)
                    .then((response) => response.json())
                    .then((responseJson) => {
                        var latestMessageList = responseJson
                        latestMessage = latestMessageList[latestMessageList.length-1]
                        // console.log(latestMessage)
                        
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                return(
                    <View key={data} style={styles.chatBar}>
                        <Text style={styles.name}>{data}</Text>
                        <Text style={styles.message}></Text>
                    </View>
                )
            })
            
            return (
            <View style={styles.container}>

                <Modal visible={this.state.showModal}>
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
                            <Button title="Let's go!" size={100} color="#a11485" onPress={() => this.setState({ showModal: true }) }/>
                        </View>
                    </View>
                </Modal>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp - {this.state.storedName} </Text>
                    <Button styel={styles.addbutton} title="Modal" onPress={() => this.addMore()}></Button>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    
                    {chatArray}

                </ScrollView>

            </View>
            );
        } else {
            return(
                <Text>Loading ..</Text>
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
