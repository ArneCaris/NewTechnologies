import React, {Component} from 'react';
import { Image, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView} from 'react-native';

export default class Home extends Component {

    constructor() {
        super();
        this.state = {
            chats: [],
            messages: [],
            showModal: false,
        }
    }

    componentDidMount() {
        fetch("http://newtechproject.ddns.net:4000/chats")
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ chats: responseJson }, () => console.log(this.state.chats[0].groupName))
            })
            .catch((error) => {
            console.error(error);
            });
        fetch("http://newtechproject.ddns.net:4000/messages")
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ messages: responseJson }, () => console.log(this.state.messages[0].message))
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
    }

    render() {

        if (this.state.chats.length !== 0 && this.state.messages.length !== 0) {
            
            return (
            <View style={styles.container}>

                <Modal visible={this.state.showModal}>
                    <View style={styles.explanationText}>
                        <Text style={styles.noteMsg}>Welcome to ChatApp!{"\n"}Please choose a username for yourself.{"\n"}This can be absolutely anything!{"\n"}If your username already exists you can choose to either choose a different username or go on a merry adventure with a username that somebody else used before you.</Text>
                        <Text style={styles.noteMsg}>{"\n\n"}NOTE! Messages and chats will remain with the username when you choose to have a different one!</Text>
                        <TextInput
                            style={styles.TextInput}
                            placeholder="display name"
                        />
                        <Button style={styles.addbutton} title="Let's go!" onPress={() => this.setState({ showModal: false })}/>
                    </View>
                </Modal>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp </Text>
                    <Button styel={styles.addbutton} title="Modal" onPress={() => this.setState({ showModal: true })}></Button>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.chatBar}>
                        <Text style={styles.name}>{this.state.chats[0].groupName}</Text>
                        <Text style={styles.message}>{this.state.messages[this.state.messages.length-1].message}</Text>
                    </View>

                </ScrollView>

                {/* <View stye={styles.footer}>
                    <TextInput 
                        style={styles.textInput} 
                        placeholder='>note' 
                        placeholderTextColor='white' 
                        underlineColorAndroid='transparent'>
                    </TextInput>
                </View> */}

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
        marginBottom: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    textInput: {
        alignSelf: 'stretch',
        color: '#fff',
        padding: 20,
        backgroundColor: '#252525',
        borderTopWidth: 2,
        borderTopColor: '#ededed',
    },
    addbutton: {
        position: 'absolute',
        zIndex: 11,
        right: 20,
        bottom: 90,
        backgroundColor: '#E91E63',
        width: 90,
        height: 90,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        color: 'black',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
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
    noteMsg: {
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
        
    }
    
});
