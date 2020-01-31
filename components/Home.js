import React, {Component} from 'react';
import { Image } from 'react-native';
import {Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView} from 'react-native';

export default class Home extends Component {

    constructor() {
        super();
        this.state = {
            chats: [],
            messages: [],
        }
    }

    componentDidMount() {
        fetch("http://newtechproject.ddns.net:4000/groups")
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
    }

    render() {

        if (this.state.chats.length !== 0 && this.state.messages.length !== 0) {
            
            return (
            <View style={styles.container}>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}> ChatApp </Text>
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
    headerText: {
        color: 'white',
        fontSize: 22,
        padding: 26,
        fontWeight: 'bold'
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
    }
    
});
