package edu.umich.tabletalk.tabletalkclient;

/**
 * Created by Blake on 4/18/2018.
 */
import android.content.Context;
import android.content.Intent;
import android.support.v7.widget.AppCompatTextView;
import android.view.View;
import android.widget.TextView;


public class ChatRow extends AppCompatTextView implements View.OnClickListener {


    private String chatID;
    private Context privateContext;

    public ChatRow(String newChatID, Context context) {
        super(context);
        this.chatID = newChatID;
        this.privateContext = context;
        //get data server
    }

    public ChatRow(Context context) {
        super(context);
        this.privateContext = context;

    }

    public void onClick(View v) {

        Intent myIntent = new Intent(this.privateContext, Message.class);
        myIntent.putExtra("Chat_ID", chatID);
        privateContext.startActivity(myIntent);

    }
}