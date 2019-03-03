import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import './App.css';



const particlesOptions = {
  particles: {
    number: {
      value: 75,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: "",
  imageUrl: "",
  boxes: [],
  route: "signin",
  isSignedIn: false,
  user: {
    userid: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  };
    
  loadUser = (data) => {
    const {userid, name, email, entries, joined} = data;
    this.setState({user: {
      userid: userid,
      name: name,
      email: email,
      entries: entries,
      joined: joined
    }});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFaces = data.outputs[0].data.regions;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    const boxes = [];
    clarifaiFaces.map(face => {
      let clarifaiFace = face.region_info.bounding_box;
      boxes.push({
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      })
      return 0;
    });

    return boxes;
  };

  displayFaceBoxes = (boxes) => {
    this.setState({boxes: boxes});
  }

  onInputChange = (event) => {
    this.setState( {input: event.target.value });
  };

  onPictureSubmit = () => {
    this.setState( {imageUrl: this.state.input} );
      fetch('https://ancient-earth-29470.herokuapp.com/imageurl',{
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if(response){
          fetch('https://ancient-earth-29470.herokuapp.com/image',{
            method: "put",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              id: this.state.user.userid
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
        }
        this.displayFaceBoxes(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
  };

  onRouteChange = (route) =>{
    if(route === "signout"){
      this.setState(initialState)
    } else if(route ==="home"){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route, boxes } = this.state;
    const {name, entries} = this.state.user;

    return (
      <div className="App">
        <Particles className='particles' 
          params={particlesOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { route === "home"
          ? <div>
              	<Logo />
              <Rank name={name} entries={entries}/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onPictureSubmit={this.onPictureSubmit} 
              />
              <FaceRecognition 
                boxes={boxes}
                imageUrl={imageUrl}
              />
            </div>
          : ( 
              route === "signin"
              ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
        }
      </div>
    );
  }
}

export default App;
