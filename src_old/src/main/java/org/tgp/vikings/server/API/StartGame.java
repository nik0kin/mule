package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONObject;
import org.json.JSONStringer;
import org.json.JSONTokener;
import org.tgp.vikings.enums.GameStatus;
import org.tgp.vikings.enums.PlayerGameStatus;
import org.tgp.vikings.enums.TerrainType;
import org.tgp.vikings.other.MapGenerator;
import org.tgp.vikings.server.Game;
import org.tgp.vikings.server.GameEntity;
import org.tgp.vikings.server.PGIEPersistence;
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerGameInfoEntity;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TileEntity;
import org.tgp.vikings.server.TilePersistence;

/**
 * This servlet is responsible for adding a new GameEntity 
 *  and joining the player (creating a PlayerGameInfoEntity)
 */
public class StartGame extends HttpServlet {

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
   private int status;
   private String statusMsg;
   private int gameID;

   
   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
      response.setContentType("text/html;charset=UTF-8");
      PrintWriter out = response.getWriter();

      helper(request);

      String responseStr = new JSONStringer()
              .object()
              .key("status")
              .value(status)
              .key("statusMsg")
              .value(statusMsg)
              .key("gameID")
              .value(gameID)
              .endObject()
              .toString();

      try {
         out.println(responseStr);
      } finally {
         out.close();
      }


   }

   protected void helper(HttpServletRequest request) {
      String token;//of the player
      int playerID = -1;

      try {
         token = request.getParameter("token");
         if (token == null) {
            throw new Exception();
         }
      } catch (Exception e) {
         status = -1;
         statusMsg = "Missing token";
         return;
      }

      try {
         //get playerID from token
         playerID = playerPersistance.getPlayerFromToken(token).getID();
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid token";
         return;
      }

      JSONObject gameConfig = null;
      try{
         gameConfig = new JSONObject(new JSONTokener(request.getParameter("gameConfig")));
      }catch(Exception e){
         status = -1;
         statusMsg = "Unable to parse JSON gameConfig";
         return;
      }
      GameEntity g = new GameEntity();

      String name;
      try {
         name = gameConfig.getString("name");
      } catch (Exception e) {
         name = "null";
      }

      int width;
      try {
         width = (Integer.parseInt(gameConfig.getString("width")));
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid Width: "+ gameConfig.getString("width");
         return;
      }

      int height;
      try {
         height = (Integer.parseInt(gameConfig.getString("height")));
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid Height: "+ gameConfig.getString("height");
         return;
      }
      
      int numofplayers = -1;
      try {
         numofplayers = (Integer.parseInt(gameConfig.getString("numofplayers")));
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid Number of Players: "+ gameConfig.getString("numofplayers");;
         return;
      }
      if(numofplayers < 2){
         status = -1;
         statusMsg = "Must have greater than 1 player in a game";
         return;
      }
      
      

      //add game and persist(after now)
      if (name == null || name.equals("null")) {
         name += "-(" + width + "_" + height + ")";
      }
      g.setName(name);
      g.setWidth(width);
      g.setHeight(height);
      g.setNumOfPlayers(numofplayers);
      //change game status
      g.setGameStatus(GameStatus.open);
      
      game.setGameEntity(g);
      
      System.out.println("adding: " + g.toString());
      boolean b = persistenceManager.persist();
      if (!b && !persistenceManager.flush() ) {
         status = -1;
         statusMsg = "Failed to persistGame";
         return;
      }

      status = 0;
      statusMsg = "Success";
      gameID = g.getID();


      //adding tiles

      try {
         TerrainType[][] map = MapGenerator.getMap(width, height);

         TileEntity entityMap[][] = new TileEntity[width][height];
         for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
               //System.out.println("Adding [" + x + "," + y + "]");
               TileEntity tile = new TileEntity();
               tile.setGameID(gameID);
               tile.setPosition(new int[]{x, y});
               tile.setTerrainType(map[x][y]);

               tilePersistance.addTile(tile);
               entityMap[x][y] = tile;

            }
         }

         g.setMap(entityMap);
         //game.setGameEntity(g);
         b =  persistenceManager.update(g);
         if (!b) {
            status = -1;
            statusMsg = "Failed to persistGame-2";
            return;
         }

      } catch (Exception e) {
         // System.out.print(e.toString());
         status = -1;
         statusMsg = "Failed to persist Game Entity: " + e.getMessage();
         System.out.println("ERROR:");
         e.printStackTrace();
         //gameID = -1;
      }

      //add make a PGIE for the player who created this game
      PlayerGameInfoEntity piggie = new PlayerGameInfoEntity();
      piggie.setGameID(gameID);
      piggie.setPlayerID(playerID);
      piggie.setPlayerNum((short)0);//first player
      piggie.setPlayerStatus(PlayerGameStatus.ingame);
      
      try {
         b = pgiePersistance.addPGIE(piggie);
         if (!b) {
            throw new Exception();
         }
      } catch (Exception e) {
         status = -1;
         statusMsg = "Failed to persist piggie";
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
