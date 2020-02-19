import {StyleSheet} from 'react-native';

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
        marginLeft: 10,
        marginRight: 10, 
    },
    title: {
        marginTop: -40,
        fontSize: 30,
        color: "#a11485",
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
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
    modalButton: {
        position: 'absolute',
        margin: 16,
        right: 10,
        bottom: 10,
    },
    chatBar: {
        height: 85,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    name: {
        left: 45,
        top: 14,
        fontWeight: 'bold',
    },
    message: {
        left: 45,
        top: 22,
    },
    timeStamp:{
        marginTop: '7%',
        alignSelf: 'flex-end',
        fontSize: 12
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
    },
    scrollContainer: {
        flex: 5,
        height: 600,
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