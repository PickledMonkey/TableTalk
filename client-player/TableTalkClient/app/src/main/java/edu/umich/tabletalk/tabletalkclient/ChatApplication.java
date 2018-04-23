package edu.umich.tabletalk.tabletalkclient;

import android.app.Application;
import io.socket.client.IO;
import io.socket.client.Socket;

import java.net.URISyntaxException;

public class ChatApplication extends Application {

    private Socket mSocket;
    public ChatApplication()
    {
        try {
            System.out.println(Constants.CHAT_SERVER_URL);
            mSocket = IO.socket(Constants.CHAT_SERVER_URL);
            mSocket.connect();
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }catch (Exception e){
            System.out.println(e);
        }
    }

    public Socket getSocket() {
        System.out.println("Returning socket");
        return mSocket;
    }
}
