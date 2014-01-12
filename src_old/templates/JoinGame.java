package org.tgp.vikings.server.API;

import javax.inject.Inject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import org.json.JSONStringer;
import org.tgp.vikings.server.Game;
import org.tgp.vikings.server.PGIEPersistance;
import org.tgp.vikings.server.PersistenceManager;
import org.tgp.vikings.server.PlayerPersistance;
import org.tgp.vikings.server.TilePersistance;

/**
 * This servlet is responsible joining players to games
 */
public class JoinGame extends HttpServlet {

   @Inject
   Game game;
   @Inject
   PersistenceManager persistenceManager;
   @Inject
   TilePersistance tilePersistance;
   @Inject
   PGIEPersistance pgiePersistance;
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
