
package org.tgp.vikings.server;

import java.io.Serializable;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Resource;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import javax.persistence.TypedQuery;
import javax.transaction.UserTransaction;

/**
 *
 * @author Niko
 * 
 */

@SessionScoped
public class PGIEPersistence  implements Serializable{
    @PersistenceContext(unitName = "PGIE-unit")
    private EntityManager entityManager;

    @Inject
    PersistenceManager persistenceManager;
    
    @Resource
    UserTransaction utx;
    
    private static Logger logger = Logger.getLogger(PGIEPersistence.class.getName());
    
    
    public boolean addPGIE(PlayerGameInfoEntity info) throws Exception {
       try {
            utx.begin();
            entityManager.persist(info);
            utx.commit();
            return true;
        } catch (Exception ex) {
            try {
                utx.rollback();
            } catch (Exception txe) {
                logger.log(Level.WARNING, txe.getMessage(), txe);
            }
            logger.log(Level.WARNING, ex.getMessage(), ex);
            return false;
        } finally {
            //entityManager.close();
        }
    }
    //returns null if its the playerID is in gameID
    public PlayerGameInfoEntity getPlayerInGame(int gameID, int playerID) throws Exception{
       for(PlayerGameInfoEntity pig : getGamePlayers(gameID)){
          if(pig.getPlayerID() == playerID)
            return pig;
       }
       
       return null;
    }
    /*
    //check if all spots are taken in the game
    public boolean checkIfGameFullAndReady(int gameID) throws Exception {
       int players = persistenceManager.getGameByID(gameID).getNumOfPlayers();
       
       boolean spots[] = new boolean[players];
       
       List<PlayerGameInfoEntity> piggies = getGamePlayers(gameID);
       for(PlayerGameInfoEntity pig : piggies){
          spots[pig.getPlayerNum()] = true;
       }
       
       for(int i=0;i<spots.length;i++){
          if(!spots[i])
             return false;
       }
       
       return true;
    }*/

    public List<PlayerGameInfoEntity> getGamePlayers(int gameID) throws Exception {
        TypedQuery<PlayerGameInfoEntity> query = entityManager.createNamedQuery("PGIE.selectByGameID",PlayerGameInfoEntity.class);
        query.setParameter("someID", gameID);
        
        return  query.getResultList();
    }
    
    public List<PlayerGameInfoEntity> getPlayerGames(int playerID) throws Exception {
        TypedQuery<PlayerGameInfoEntity> query = entityManager.createNamedQuery("PGIE.selectByPlayerID",PlayerGameInfoEntity.class);
        query.setParameter("someID", playerID);
        
        return query.getResultList();
    }
    
    //figures out and returns the first available spot, in specified gameID
    // returns -1 if full
    public int getFirstAvailableSpot(int gameID) throws Exception{
       //we need to know total amount of spots
       int players = persistenceManager.getGameByID(gameID).getNumOfPlayers();
       
       boolean spots[] = new boolean[players];
       
       List<PlayerGameInfoEntity> piggies = getGamePlayers(gameID);
       for(PlayerGameInfoEntity pig : piggies){
          spots[pig.getPlayerNum()] = true;
       }
       
       for(int i=0;i<spots.length;i++){
          if(!spots[i])
             return i;
       }
       
       return -1;
    }
    
   
    public boolean checkIfSpotOpen(int gameID,int spot) throws Exception{
       //we need to know total amount of spots
       int players = persistenceManager.getGameByID(gameID).getNumOfPlayers();
       
       boolean spots[] = new boolean[players];
       
       List<PlayerGameInfoEntity> piggies = getGamePlayers(gameID);
       for(PlayerGameInfoEntity pig : piggies){
          spots[pig.getPlayerNum()] = true;
       }
       
       return spot < spots.length && !spots[spot];
    }
}
