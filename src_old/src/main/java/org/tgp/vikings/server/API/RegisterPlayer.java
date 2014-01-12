package org.tgp.vikings.server.API;



import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Random;
import org.json.JSONStringer;
import org.tgp.vikings.server.PlayerEntity;
import org.tgp.vikings.server.PlayerPersistance;


public class RegisterPlayer extends HttpServlet {
    @Inject
    PlayerPersistance playerPersistance;


    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();

        int status = 0;
        String statusMsg = "Success";
        String token = "";
        
        PlayerEntity p = new PlayerEntity();
        
        String username = "";
        try{
            username = (request.getParameter("username") );
            if(username == null)
               throw new Exception();
        }catch(Exception e){
            status = -1;
            statusMsg = "Invalid username";
        }
        
        //TODO check if username exists
        
        //add player
        if(status == 0){
            p.setUsername(username);
            token = username+ new Random().nextInt(100);
            p.setActiveToken(token);

            System.out.println("adding Player: "+p.toString());
            try{
               if(!playerPersistance.addPlayer(p))
                  throw new Exception();
            }catch(Exception e){
               status = -1;
               statusMsg = "failed to persist player";
            }
            
        }
                
        
        String responseStr = new JSONStringer()
                    .object()
                        .key("status")
                           .value(status)
                        .key("statusMsg")
                           .value(statusMsg)
                        .key("token")
                           .value(token)
                    .endObject()
                    .toString();
        
        try {
            out.println(responseStr);
        } finally {
            out.close();
        }
        
        
    }


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

}
