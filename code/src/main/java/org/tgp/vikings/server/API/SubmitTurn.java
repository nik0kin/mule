package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONStringer;
import org.json.JSONTokener;
import org.json.JSONWriter;
import org.tgp.vikings.server.PGIEPersistence;
import org.tgp.vikings.server.PlayerGameInfoEntity;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TurnLogicBrain;

/**
 * This servlet is responsible joining players to games
 */
public class SubmitTurn extends HttpServlet {
   @Inject
   PGIEPersistence pgiePersistance;
   @Inject
   PlayerPersistance playerPersistance;
   @Inject
   TurnLogicBrain brain;
   
   //parameters
   private String token;
   private int gameID;
   private JSONObject[] instructions;
   
   //returns
   private int status;
   private String statusMsg;
   private String[] instructionsStatus;

   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      response.setContentType("text/html;charset=UTF-8");
      PrintWriter out = response.getWriter();

      helper(request);

      JSONWriter responseJ = new JSONStringer()
              .object()
              .key("status")
              .value(status)
              .key("statusMsg")
              .value(statusMsg)
              .key("instructionStatus")
              .array();
      if(instructionsStatus != null)
         for(int i=0;i<instructionsStatus.length;i++)
            responseJ = responseJ.value(instructionsStatus[i]);

      String responseStr = responseJ
              .endArray()
              .endObject()
              .toString();
              
      try {
         out.println(responseStr);
      } finally {
         out.close();
      }


   }
   //TurnLogicBrain.validTypes[]
   protected void helper(HttpServletRequest request) {
      //parse parameters
      token = request.getParameter("token");
      
      int playerID,playerSpot;
      try {
         //get playerID from token
         playerID = playerPersistance.getPlayerFromToken(token).getID();
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid token: "+ token;
         return;
      }
      
      System.out.println("Recieved turn from pid: "+playerID);
      
      try{
         gameID = Integer.parseInt(request.getParameter("gameID"));
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid gameID parse: "+request.getParameter("gameID");
         return;
      }
      int size;
      try{
         size = Integer.parseInt(request.getParameter("size"));
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid instruction array size: "+request.getParameter("size");
         return;
      }
      instructions = new JSONObject[size];
      try{
         String instructionsR = request.getParameter("instructions");//instructions from request 
         JSONArray instructionsJ = new JSONArray(new JSONTokener(instructionsR));
         for(int i=0;i<instructionsJ.length();i++)
            instructions[i] = instructionsJ.getJSONObject(i);
      }catch(Exception e){
         status = -1;
         statusMsg = "Error loading instructions array from request: "+e.getLocalizedMessage();
         return;
      }
        //figure out playerSpot from playerID (playerID must be in gameID)
      PlayerGameInfoEntity pig;
      try{
         pig = pgiePersistance.getPlayerInGame(gameID, playerID);
         if(pig == null) throw new Exception();
         playerSpot = pig.getPlayerNum();
      }catch(Exception e){
         status = -1;
         statusMsg = "playerID["+playerID+"] not in gameID["+gameID+"]";
         return;
      }
      
      if(instructions.length == 0){
         status = 2;
         statusMsg = "instructions.length equals zero";
         return;
      }
      
      //parse instructions
      //brain.submitTurn will create turn entitys for valid instructions
      instructionsStatus = new String[size];
      int i = 0;
      boolean allValid = true,allInvalid = true;
      for(JSONObject o : instructions){
         try{ 
            instructionsStatus[i] = brain.submitTurn(gameID,playerSpot, o);
            if(instructionsStatus[i].equals("")) 
               allInvalid = false;
            else 
               allValid = false;
            i++;
         }catch(Exception e){
            instructionsStatus[i] = "EXCEPTION: "+e.getLocalizedMessage();
            e.printStackTrace();
         }
      }
      if(!allValid){
         status = 1;//some valid
         statusMsg = "Some Turn Instructions Valid";
         return;
      }
      if(allInvalid){
         status = 2;//all invalid
         statusMsg = "All Instructions Invalid";
         return;
      }
         
      status = 0;
      statusMsg = "Success";
   }

   /**
    * Handles the HTTP
    * <code>GET</code> method by simply invoking {@link #processRequest}.
    *
    * @param request servlet request
    * @param response servlet response
    * @throws ServletException if a servlet-specific error occurs
    * @throws IOException if an I/O error occurs
    */
   @Override
   protected void doGet(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      processRequest(request, response);
   }

   /**
    * Handles the HTTP
    * <code>POST</code> method by simply invoking {@link #processRequest}.
    *
    * @param request servlet request
    * @param response servlet response
    * @throws ServletException if a servlet-specific error occurs
    * @throws IOException if an I/O error occurs
    */
   @Override
   protected void doPost(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      processRequest(request, response);
   }
}
