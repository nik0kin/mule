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
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerPersistance;

/**
 * This servlet is responsible for searching and displaying the Telephone
 * directory entries by given location.
 */
public class ListGames extends HttpServlet {

   @Inject
   PersistenceManager persistenceManager;

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
      String statusMsg = "";

      //Check which player is requesting
      int playerID = -1;
      try{
         playerID = playerPersistance.getPlayerFromToken(request.getParameter("token")).getID();
      }catch(Exception e){
         status = -1;
         statusMsg = "Invalid Token";
      }
      
      System.out.println("Recieving Request for to ListGames, pID: "+playerID);
      
      List<GameEntity> openGames = null;
      List<GameEntity> playersGames = null;

      int sizeO = 0, sizeM = 0;
      if(status == 0)
      try {
         openGames = persistenceManager.getOpenGames();
         sizeO = openGames.size();
         playersGames = persistenceManager.getPlayersGames(playerID);
         sizeM = playersGames.size();
      } catch (Exception e) {
         e.printStackTrace();
         status = -1;
         statusMsg = "Error retrieving List";
      }


      JSONWriter responseJ = new JSONStringer()
              .object()//remember to close this
               .key("status")
                  .value(status)
               .key("statusMsg")
                  .value(statusMsg)
               .key("sizeO")
                  .value(sizeO)
               .key("sizeM")
                  .value(sizeM);
               
      int i = 0;
      if (status == 0) {
         //open games
         responseJ = responseJ.key("listO").object();
         for (GameEntity g : openGames) {
            responseJ = responseJ.key(i + "")
                    .object()
                     .key("id")
                        .value(g.getID())
                     .key("name")
                        .value(g.getName())
                     .key("numofplayers")
                        .value(g.getNumOfPlayers())
                     .key("status")
                        .value(g.getGameStatus().ordinal())
                     .key("turn")
                        .value(g.getTurn())
                    .key("joined")
                        .value((playersGames.contains(g)) ? "true" : "false")
                    .endObject();
            i++;
         }

         responseJ = responseJ.endObject();
         
         //my games
         responseJ = responseJ.key("listM").object();
         for (GameEntity g : playersGames) {
            responseJ = responseJ.key(i + "")
                    .object()
                     .key("id")
                        .value(g.getID())
                     .key("name")
                        .value(g.getName())
                     .key("numofplayers")
                        .value(g.getNumOfPlayers())
                     .key("status")
                        .value(g.getGameStatus().ordinal())
                     .key("turn")
                        .value(g.getTurn())
                    .key("joined")
                        .value("true")
                    .endObject();
            i++;
         }

         responseJ = responseJ.endObject();
      }

      responseJ = responseJ.endObject();//end object

      System.out.println("listed " + i + " games");

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
