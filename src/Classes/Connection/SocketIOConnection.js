import io from 'socket.io-client';

export default class SocketIOConnection {

    static connected(){
        if(!this.state)
            this.state = false;
        return this.state;
    }

    static connect(url){
        this.socket = io(url);
        this.socket.on('connect', () => this.state = true);
    }
}