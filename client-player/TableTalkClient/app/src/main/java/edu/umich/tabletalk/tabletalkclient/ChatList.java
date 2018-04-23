package edu.umich.tabletalk.tabletalkclient;

/**
 * Created by Blake on 4/18/2018.
 */

import android.app.ListActivity;
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.*;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class ChatList extends ListActivity {

    private List<String> mTopics = new ArrayList<>();
    private List<String> mUsernames = new ArrayList<>();
    private String mUsername;
    private Socket mSocket;
    private TextView text;
    private HashMap<String, String> mTopicsMap = new HashMap<>();
    private HashMap<String, String> mTopicIds = new HashMap<>();
    private ArrayAdapter<String> mTopicListAdapter;
    protected List<String> getActiveChats(){
        List<String> activeChats = new ArrayList<String>();
        // Ask server for a list of chat IDs and return them to the create function
        return activeChats;
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle extras = getIntent().getExtras();
        if(extras == null) {
            mUsername= null;
        } else {
            mUsername = extras.getString("username");
        }
        ChatApplication app = (ChatApplication) getApplication();
        mSocket = app.getSocket();
        mSocket.on("sendConversationsList", onSendConversationList);
        mSocket.on("newConversationAdded", onNewConversationAdded);
        mSocket.on("sendFullPlayerList", onSendFullPlayerList);
        text = (TextView) findViewById(R.id.mainText);
        // initiate the listadapter
        mTopicListAdapter = new ArrayAdapter <String>(this,
                R.layout.topics_list_item, R.id.listText, mTopics);
        // assign the list adapter
        setListAdapter(mTopicListAdapter);
        setContentView(R.layout.topic_list);
        JSONObject msg = new JSONObject();
        try {
            msg.put("playerName", mUsername);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        mSocket.emit("getConversationsList", msg);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mSocket.off("sendConversationsList", onSendConversationList);
        mSocket.off("newConversationAdded", onNewConversationAdded);
    }

    private Emitter.Listener onSendConversationList = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            try {
                System.out.println("trying to get chats");
                JSONArray conversationList = (JSONArray) args[0];
                mTopics.clear();
                mTopicIds.clear();
                mTopicsMap.clear();
                for(int i=0;i<conversationList.length();i++){
                    JSONObject chat = conversationList.getJSONObject(i);
                    String topic = chat.getString("topic");
                    String topicId = chat.getString("_id");
                    addTopicToListView(topic, topicId);
                    System.out.println(topic);
                }
            } catch (JSONException e) {
                return;
            }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mTopicListAdapter.notifyDataSetChanged();
                }
            });
        }
    };

    private Emitter.Listener onNewConversationAdded = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            JSONObject msg = new JSONObject();

            try {
                msg.put("playerName", mUsername);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            mSocket.emit("getConversationsList", msg);
        }
    };

    private Emitter.Listener onSendFullPlayerList = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            JSONArray players = (JSONArray) args[0];
            int numUsers;
            try {
                for (int i = 0; i < players.length(); i++)
                {
                    mUsernames.add(players.get(i).toString());
                }
                numUsers = players.length();
            } catch (JSONException e) {
                return;
            }
        }
    };

    private String getTopicNameFromNumbered(String numberedTopic)
    {
        Pattern p = Pattern.compile("[0-9]+[:][\t](.*)");
        Matcher m = p.matcher(numberedTopic);
        if(m.matches())
        {
            return m.group(1);
        }
        return null;
    }

    private String getTopicNameNumbered(String topic, int number)
    {
        return Integer.toString(number)+":\t"+topic;
    }

    private void addTopicToListView(String topic, String topicId)
    {
        String numberedTopic = getTopicNameNumbered(topic, mTopics.size());
        mTopicsMap.put(numberedTopic, topic);
        mTopicIds.put(numberedTopic, topicId);
        mTopics.add(numberedTopic);
    }
    // when an item of the list is clicked
    @Override
    protected void onListItemClick(ListView list, View view, int position, long id) {
        super.onListItemClick(list, view, position, id);
        String selectedItem = (String) getListView().getItemAtPosition(position);
        String selectedTopic = mTopicsMap.get(selectedItem);
        String selectedTopicId = mTopicIds.get(selectedItem);
        System.out.println("selected " + selectedItem);
        Intent intent = new Intent();
        intent.putExtra("topic", selectedTopic);
        intent.putExtra("topic_id", selectedTopicId);
        intent.putExtra("username", mUsername);
        intent.putExtra("from", "chatlist");
        setResult(RESULT_OK, intent);
        finish();
    }
}
