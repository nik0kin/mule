package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONStringer;
import org.tgp.vikings.enums.GameStatus;
import org.tgp.vikings.enums.PlayerGameStatus;
import org.tgp.vikings.server.BeginGameFactory;
import org.tgp.vikings.server.Game;
import org.tgp.vikings.server.GameEntity;
import org.tgp.vikings.server.PGIEPersistence;
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerGameInfoEntity;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TilePersistence;

/**
 * This servlet is responsible joining players to games
 */
public class JoinGame extends HttpServlet {

   @Inject
   Game game;
   @Inject
   PersistenceManager persistenceManager;
   @Inject
   TilePersistence tilePersistance;
   @Inject
   PGIEPersistence pgiePersistance;
   @Inject
   PlayerPersistance playerPersistance;
   @Inject
   BeginGameFactory beginGameFactory;
   
   //parameters
   private int gameID;
   private String token;
   private int spot = -1;
   
   //returns
   private int status;
   private String statusMsg;
   private boolean gameStarted;



   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      response.setContentType("text/html;charset=UTF-8");
      PrintWriter out = response.getWriter();

      //setup parameters
      token = request.getParameter("token");
      try{
         gameID = Integer.parseInt(request.getParameter("gameID"));
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid gameID parse: "+request.getParameter("gameID");
         return;
      }
      try{
         spot = Integer.parseInt(request.getParameter("spot"));
      }catch(Exception e){
         spot = -1;
      }
      
      //call JoinGame
      helper();

      
      //send response
      String responseStr = new JSONStringer()
              .object()
              .key("status")
              .value(status)
              .key("statusMsg")
              .value(statusMsg)
              .key("gameStarted")
              .value(gameStarted)
              .endObject()
              .toString();

      try {
         out.println(responseStr);
      } finally {
         out.close();
      }

   }

   protected void helper() {
      //Check which player is requesting
      int playerID = -1;
      try{
         playerID = playerPersistance.getPlayerFromToken(token).getID();
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid Token";
         return;
      }
      
      //check if game is open?
      GameEntity game;
      try{
         game = persistenceManager.getGameByID(gameID);
      }catch(Exception e){
         status = -1;
         statusMsg = "Failed to get-persist for game(id): " + gameID;
         return;
      }
      
      if(game.getGameStatus() != GameStatus.open){
         status = 3;
         statusMsg = "Game not Open";
         return;
      }
      
      //check if you the player is already in the game
      try{
         if(pgiePersistance.getPlayerInGame(gameID,playerID) != null){
            status = 1;
            statusMsg = "player["+playerID+"] is already in game["+gameID+"]";
            return;
         }
         
      }catch(Exception e){
         status = -1;
         statusMsg = "Failed to checkIfPlayerInGame for game(id): " + gameID +" pID: "+playerID;
         return;
      }
      
      //checks if games not full 
      int firstA = -1; 
      try{
         firstA = pgiePersistance.getFirstAvailableSpot(gameID);
      }catch(Exception e){
         status = -1;
         statusMsg = "Failed to check spots for game(id): " + gameID;
         return;
      }
      
      if(firstA == -1){//game full
         status = 2;
         statusMsg = "Game Full game(id): " + gameID;
         return;
      }
      
      if(spot < -1 || spot >= game.getNumOfPlayers()){
         status = -1;
         statusMsg = "Invalid Spot";
         return;
      }
      
      try{
         if(spot != -1 && !pgiePersistance.checkIfSpotOpen(gameID, spot)){
            status = 4;
            statusMsg = "Spot Taken";
            return;
         }
      }catch(Exception e){
         status = -1;
         statusMsg = "Failed to check spots(2) for game(id): " + gameID;
         return;
      }
      
      //if still -1, auto join her in first spot
      if(spot == -1)
         spot = firstA;
      
      //then joins the player
      PlayerGameInfoEntity piggie = new PlayerGameInfoEntity();
      piggie.setGameID(gameID);
      piggie.setPlayerID(playerID);
      piggie.setPlayerNum((short)spot);//first player
      piggie.setPlayerStatus(PlayerGameStatus.ingame);
      
      try {
         boolean b = pgiePersistance.addPGIE(piggie);
         if (!b) {
            throw new Exception();
         }
      } catch (Exception e) {
         status = -1;
         statusMsg = "Failed to persist piggie";
         return;
      }
      
      status = 0;
      statusMsg = "Successful Join: spot("+spot+")";
      
      System.out.println(playerID+"joined gameID["+gameID+"] at spot "+spot);
      
      //if everything went well, check if the game is live and playable
      if(checkIfGameReady()){
         //i dont know if we should make this response wait on starting the game
         
         try{
            gameStarted = beginGameFactory.BeginGame(gameID);
         }catch(Exception e){
            status = -1;
            statusMsg = "Failed to BeginGame";
            gameStarted = false;
         }
         

      }

      
   }
      //this function passes it off to the start game factory?
      // and returns if successful?
      private boolean checkIfGameReady(){
         try{
            return pgiePersistance.getFirstAvailableSpot(gameID) == -1;
         }catch(Exception e){
            status = -1;
            statusMsg = "Failed check if game ready and full: game("+gameID+") \n"+e.getLocalizedMessage();
            return false;
         }
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
