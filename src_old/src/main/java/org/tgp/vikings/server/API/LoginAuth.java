package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONStringer;
import org.tgp.vikings.server.PlayerEntity;
import org.tgp.vikings.server.PlayerPersistance;

public class LoginAuth extends HttpServlet {

   @Inject
   PlayerPersistance playerPersistance;

   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      response.setContentType("text/html;charset=UTF-8");
      PrintWriter out = response.getWriter();

      int status = 0;
      String statusMsg = "";
      String token = "";

      PlayerEntity p = null;

      //get player entity
      String username = "";
      try {
         username = (request.getParameter("username"));
         if (username == null) {
            throw new Exception();
         }
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid username";
      }
      System.out.println("Trying login for user: "+username);
      
      if (status == 0) {
         try {
            p = playerPersistance.getPlayer(username);
         } catch (Exception e) {
            status = -1;
            statusMsg = "error getting persisted player";
         }
         if(p == null && status == 0){
            status = -1;
            statusMsg = "No player with that username found";
         }
      }

      //generate/return token 
      if(status == 0){
         token = p.getActiveToken();
         System.out.println("Logged in id: "+p.getID()+" token="+token);
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
