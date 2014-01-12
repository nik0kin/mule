
package org.tgp.vikings.server;

import java.io.Serializable;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Resource;
import javax.enterprise.context.SessionScoped;
import javax.persistence.TypedQuery;
import javax.transaction.UserTransaction;
import org.tgp.vikings.enums.TurnType;

/**
 *
 * @author Niko
 * 
 */

@SessionScoped
public class TurnPersistence  implements Serializable{
    @PersistenceContext(unitName = "TURN-unit")
    private EntityManager entityManager;
    
    @Resource
    UserTransaction utx;
    
    private static Logger logger = Logger.getLogger(TurnPersistence.class.getName());
    
    
    public boolean addTurn(TurnEntity turn) throws Exception {
       try {
            utx.begin();
            entityManager.persist(turn);
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

    public List<TurnEntity> getTurnsByTurnNumber(int gameID, int turnNumber) throws Exception {
        TypedQuery<TurnEntity> query = entityManager.createNamedQuery("TURN.selectByGameIDandNumber",TurnEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someNum", turnNumber);
        
        return  query.getResultList();
    }
    
    public List<TurnEntity> getTurnsByTurnNumberAndOwner(int gameID, int turnNumber, int owner) throws Exception {
        TypedQuery<TurnEntity> query = entityManager.createNamedQuery("TURN.selectByGameIDandNumberandOwner",TurnEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someNum", turnNumber);
        query.setParameter("someOwner", owner);
        
        return query.getResultList();
    }
    
    public List<TurnEntity> getTurnsByTurnNumberAndType(int gameID, int turnNumber, TurnType type) throws Exception {
        TypedQuery<TurnEntity> query = entityManager.createNamedQuery("TURN.selectByGameIDandNumberandType",TurnEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someNum", turnNumber);
        query.setParameter("someType", type);
        
        return query.getResultList();
    }
    
    public List<TurnEntity> getTurnsByTurnNumberTypeAndOwner(int gameID, int turnNumber, TurnType type, int owner) throws Exception {
        TypedQuery<TurnEntity> query = entityManager.createNamedQuery("TURN.selectByGameIDandNumberandOwnerandType",TurnEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someNum", turnNumber);
        query.setParameter("someOwner", owner);
        query.setParameter("someType", type);
        
        return query.getResultList();
    }
    
}
