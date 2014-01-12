package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;
import org.json.JSONStringer;
import org.json.JSONWriter;
import org.tgp.vikings.server.Game;
import org.tgp.vikings.server.PGIEPersistence;
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerGameInfoEntity;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TilePersistence;
import org.tgp.vikings.server.TurnEntity;
import org.tgp.vikings.server.TurnLogicBrain;
import org.tgp.vikings.server.TurnLogicBrain.TurnInfo;
import org.tgp.vikings.server.UnitEntity;

/**
 * This servlet is responsible joining players to games
 */
public class GetTurnInfo extends HttpServlet {

   @Inject
   Game game;
   @Inject
   PersistenceManager gamePersistence;
   @Inject
   TilePersistence tilePersistence;
   @Inject
   PGIEPersistence pgiePersistence;
   @Inject
   PlayerPersistance playerPersistence;
   @Inject
   TurnLogicBrain brain;
   
   //parameters
   private String token;
   private int gameID;
   private int turnNumber;
   //returns
   private int status;
   private String statusMsg;
   private JSONObject[] unitStatus;
   private JSONObject[] turnList;


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
              .key("turnNumber")
              .value(turnNumber)
              .key("unitStatus")
              .array();
      if(unitStatus != null && status >= 0)
         for(int i=0;i<unitStatus.length;i++)
            responseJ = responseJ.value(unitStatus[i]);

      responseJ = responseJ
              .endArray()
              .key("turnList")
              .array();
      if(turnList != null && status >= 0)
         for(int i=0;i<turnList.length;i++)
            responseJ = responseJ.value(turnList[i]);
      
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

   protected void helper(HttpServletRequest request) {
      //parse parameters
      token = request.getParameter("token");
      
      int playerID,playerSpot;
      try {
         //get playerID from token
         playerID = playerPersistence.getPlayerFromToken(token).getID();
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid token: "+ token;
         return;
      }
      
      System.out.println("Recieved GetTurnInfo request from pid: "+playerID);
      
      try{
         gameID = Integer.parseInt(request.getParameter("gameID"));
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid gameID parse: "+request.getParameter("gameID");
         return;
      }
      //figure out playerSpot from playerID (playerID must be in gameID)
      PlayerGameInfoEntity pig;
      try{
         pig = pgiePersistence.getPlayerInGame(gameID, playerID);
         if(pig == null) throw new Exception();
         playerSpot = pig.getPlayerNum();
      }catch(Exception e){
         status = -1;
         statusMsg = "playerID["+playerID+"] not in gameID["+gameID+"]";
         return;
      }
         //check valid turn
      try{
         turnNumber = Integer.parseInt(request.getParameter("turnNumber"));
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid turnNumber: "+request.getParameter("turnNumber");
         return;
      }
      int currentTurn = -1;
      try{
         currentTurn = gamePersistence.getGameByID(gameID).getTurn();
         if(turnNumber <= 0 || turnNumber >= currentTurn)
            throw new Exception();
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid turnNumber: "+turnNumber+" valid=["+1+"-"+(currentTurn-1)+"]";
         return;
      }
      
      //then get gameinfo
      TurnInfo turnInfo;
      try{
         turnInfo = brain.getTurnInfo(gameID, turnNumber, pig.getPlayerNum());
      }catch(Exception e){
         status = -1;
         statusMsg = "Failed retrieving persisted TurnInfo";
         e.printStackTrace();
         return;
      }
      //and parse into JSONobjects
      List<UnitEntity> units = turnInfo.getUnitStatus();
      unitStatus = new JSONObject[units.size()];
      int i=0;
      for(UnitEntity unit : units){ //hack-y for now
         JSONObject j = null;
         try{
            j = brain.getJSON(unit);
         }catch(Exception e){
            System.out.println("Error parsing unit to JSON");
            e.printStackTrace();
         }
         unitStatus[i++] = j;
      }
      
      //just turns for now
      List<TurnEntity> turns = turnInfo.getTurns();
      List<JSONObject> turnListL = new ArrayList();
      //int i=0;
      for(TurnEntity turn : turns){
         JSONObject obj = null;
         try{
            obj = brain.getJSON(turn);
         }catch(Exception e){
            System.out.println("Error parsing turn to JSON");
            e.printStackTrace();
         }
         if(obj != null)
            turnListL.add(obj);
      }
      Object[] objects = turnListL.toArray();
      turnList = new JSONObject[objects.length];
      i=0;
      for(Object o : objects)
         turnList[i++] = (JSONObject)o;
      
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
