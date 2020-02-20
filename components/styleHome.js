import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

    // common

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
        marginRight: 10,
        marginLeft: 10,
        backgroundColor: 'white' 
    },
    backBtn: {
        alignSelf: 'flex-start',
        fontSize: 40,
        color: "#a11485"
    },
    headerText: {
        color: 'white',
        fontSize: 22,
        padding: 26,
        fontWeight: 'bold',
        alignItems: 'center',
    },

    // displayName modals

    title: {
        marginTop: 40,
        fontSize: 30,
        color: "#a11485",
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    modalButton: {
        position: 'absolute',
        margin: 16,
        right: 10,
        bottom: 10,
    },

    // home 
    chatBarHome: {
        height: 80,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    name: {
        left: 25,
        top: 10,
        fontWeight: 'bold',
    },
    message: {
        flexShrink: 1,
        left: 25,
        alignSelf: 'flex-start',
        top: 25,
    },
    text: {
        top: 50,
        fontSize: 15,
        alignSelf: 'center',
        textAlign: 'center',
    },
    noteMsg: {
        top: 50,
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    TextInput: {
        borderRadius: 2,
        borderWidth: 1.1,
        borderColor: '#a11485',
        marginTop: 50,
    },

    
    // chat
    chatTitleContainter: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10, 
    },
    titleChat: {
        marginTop: -20,
        fontSize: 30,
        color: "#a11485",
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 5,
        // height: 600,
    },
    chatBar: {
        height: 'auto',
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    messageName: {
        flex:1,
        left: 25,
        top: 10,
        fontWeight: 'bold',
        // alignSelf: 'flex-start'
    },
    messageChat: {
        flex: 1,
        // alignSelf: 'flex-start',
        top: 20,
        left: 25,
        width: 370
    },
    timeStamp:{
        flex: 1,
        marginTop: 25,
        alignSelf: 'flex-end',
        fontSize: 12
    },
    sendMessageContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    messageInput: {
        flex: 1, 
        alignSelf: 'flex-start'
    },
    addButton: {
        flex: 1,
        color: '#a11485',
        alignSelf: 'flex-end',
        fontSize: 40
    },

});


export default styles;