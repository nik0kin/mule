package org.tgp.vikings.server.API;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.inject.Inject;
import org.json.JSONStringer;
import org.json.JSONWriter;
import org.tgp.vikings.server.GameEntity;
import org.tgp.vikings.server.PGIEPersistence;
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerGameInfoEntity;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TileEntity;

/**
 * This servlet is responsible for searching and displaying the Telephone
 * directory entries by given location.
 */
public class GetGameInfo extends HttpServlet {

   @Inject
   PersistenceManager persistenceManager;
   @Inject
   PGIEPersistence pgiePersistance;
   @Inject
   PlayerPersistance playerPersistance;

   /**
    * Retrieves all the {@link PersonEntity} entries from the database that
    * match the given location.
    * <p/>
    * The entries retrieved from the database are displayd in a tabular form.
    *
    * @param request servlet request
    * @param response servlet response
    * @throws ServletException if a servlet-specific error occurs
    * @throws IOException if an I/O error occurs
    */
   protected void processRequest(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {

      PrintWriter out = response.getWriter();

      int status = 0;
      String statusMsg = "Success";

      int gameID = -1;
      GameEntity game = null;

      try {
         gameID = Integer.parseInt(request.getParameter("gameID"));
      } catch (Exception e) {
         status = -1;
         statusMsg = "Invalid gameID: " + request.getParameter("gameID");
      }

      if (status == 0) {
         try {
            System.out.println("Recieving Request for gameID: " + gameID);
            game = persistenceManager.getGameByID(gameID);
            if (game == null) {
               throw new NullPointerException("game");
            }
         } catch (Exception e) {
            status = -1;
            statusMsg = "Failed to retrieve game(id): " + gameID;
         }
      }

      TileEntity[][] map = null;
      if (game != null) {
         map = game.getMap();
      }
      if (map == null) {
         status = -1;
         statusMsg = "Map Null";
      }
      JSONWriter responseJ = null;

      responseJ = new JSONStringer().object()
              .key("status")
              .value(status)
              .key("statusMsg")
              .value(statusMsg)
              .key("gameID")
              .value(gameID);


      if (status == 0) {
         responseJ = responseJ.key("width")
                 .value(game.getWidth())
                 .key("height")
                 .value(game.getHeight())
                 .key("numofplayers")
                 .value(game.getNumOfPlayers())
                 .key("gamestatus")
                 .value(game.getGameStatus().ordinal())
                 .key("turn")
                 .value(game.getTurn())
                 .key("name")
                 .value(game.getName())
                 .key("map")
                 .object();//start Map object


         for (int y = 0; y < game.getHeight(); y++) {
            responseJ = responseJ.key(y + "")
                    .object();//start height object

            for (int x = 0; x < game.getWidth(); x++) {
               responseJ = responseJ.key(x + "")
                       .object()//start and end type width object
                       .key("type")
                       .value(map[x][y].getTerrainType().ordinal())
                       .endObject();

            }
            responseJ = responseJ.endObject();//end height object
         }
         responseJ = responseJ.endObject();//end map object
         //responseJ = responseJ.endObject();
      }


      if (gameID > 0) {
         responseJ = responseJ.key("players").object();

         System.out.println("printing piggies: ");
         try {
            List<PlayerGameInfoEntity> pgies = pgiePersistance.getGamePlayers(gameID);
            for (PlayerGameInfoEntity pgie : pgies) {
               String username;
               
               try{
                  username = playerPersistance.getPlayer(pgie.getPlayerID()).getUsername();
               }catch(Exception e){
                  System.out.println("Invalid pID on PGIE-ID: "+pgie.getID());
                  username = "";
               }
                  
               responseJ = responseJ.key(pgie.getPlayerNum()+"")
                       .object()
                       .key("playerID")
                       .value(pgie.getPlayerID())
                       .key("username")
                       .value(username)
                       .key("playerStatus")
                       .value(pgie.getPlayerStatus())
                       .endObject();
               System.out.println(pgie);
            }
         } catch (Exception e) {
            System.out.println("Exception in printting pigies");
            e.printStackTrace();
         }
         responseJ = responseJ.endObject();
      }

      responseJ = responseJ.endObject();//end main object

      try {
         out.println(responseJ.toString());
      } finally {
         out.close();
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
