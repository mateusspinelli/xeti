import React, { useRef, useState } from 'react';
import './App.css';
import smileicon from './smile.png'
import clipsicon from './clip.png'
import sendicon from './send.png'

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAtohxc-WNvBCZRSBdVzwnSqARALTxGfjk",
  authDomain: "chat-basico-uou.firebaseapp.com",
  projectId: "chat-basico-uou",
  storageBucket: "chat-basico-uou.appspot.com",
  messagingSenderId: "44799206290",
  appId: "1:44799206290:web:a0b18bb2e9272e4b4fd74b",
  measurementId: "G-RPNRC1QXZB"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
          <h1>💬 Xéti</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="signinbtn" onClick={signInWithGoogle}>Login com Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="logoutbtn" onClick={() => auth.signOut()}>Logout</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <img className="icon" src={smileicon}></img>
      <img className="icon" src={clipsicon}></img>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Digite uma mensagem" />

      <button className="messagebtn" type="submit" disabled={!formValue}><img className="sendicon" src={sendicon}></img></button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img className="fotoperfil" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
