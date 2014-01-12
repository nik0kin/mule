package org.tgp.vikings.server;

import java.io.Serializable;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import org.tgp.vikings.enums.GameStatus;

/**
 *
 * @author Niko
 * // prob will rename this class or move into turn brain
 */
@SessionScoped
public class BeginGameFactory implements Serializable {
   @Inject
   PersistenceManager persistenceManager;
   @Inject
   TilePersistence tilePersistance;
   @Inject
   PGIEPersistence pgiePersistance;
   
   public boolean BeginGame(int gameID) throws Exception{
      //quickly check if in other game
      if(pgiePersistance.getFirstAvailableSpot(gameID) != -1)
         return false;
      
      //set update game status 
      GameEntity game = persistenceManager.getGameByID(gameID);
      game.setGameStatus(GameStatus.inprogress);
      game.setTurn((short)1);
      
      boolean gameStarted = persistenceManager.update(game);
      if(gameStarted)
            System.out.println("Started GameID: "+gameID);
      
      return gameStarted;
   }
}
