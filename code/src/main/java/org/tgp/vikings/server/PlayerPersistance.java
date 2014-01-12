
package org.tgp.vikings.server;

import java.io.Serializable;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;
import javax.persistence.Query;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Resource;
import javax.enterprise.context.SessionScoped;
import javax.transaction.UserTransaction;

/**
 *
 * @author Niko
 * 
 */

@SessionScoped
public class PlayerPersistance  implements Serializable{
    @PersistenceContext(unitName = "player-unit")
    private EntityManager entityManager;

    @Resource
    UserTransaction utx;
    
    private static Logger logger = Logger.getLogger(PlayerPersistance.class.getName());
    
    
    public boolean addPlayer(PlayerEntity player) throws Exception {
       try {
            utx.begin();
            entityManager.persist(player);
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


    public PlayerEntity getPlayer(int playerID) throws Exception {
        Query query = entityManager.createNamedQuery("selectbyplayerid");
        query.setParameter("someID", playerID);
        
        if(query.getResultList().isEmpty())
           return null;
        
        return (PlayerEntity) query.getResultList().get(0);
    }
    
    public PlayerEntity getPlayer(String username) throws Exception {
        Query query = entityManager.createNamedQuery("selectbyusername");
        query.setParameter("someName", username);
        
        if(query.getResultList().isEmpty())
           return null;
        
        return (PlayerEntity) query.getResultList().get(0);
    }
    
    //temporary method? til token manager
    public PlayerEntity getPlayerFromToken(String token) throws Exception {
        Query query = entityManager.createNamedQuery("selectbytoken");
        query.setParameter("someToken", token);
        
        if(query.getResultList().isEmpty())
           return null;
        
        return (PlayerEntity) query.getResultList().get(0);
    }
}
