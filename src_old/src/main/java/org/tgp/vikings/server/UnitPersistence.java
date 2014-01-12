
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
public class UnitPersistence  implements Serializable{
    @PersistenceContext(unitName = "UNIT-unit")
    private EntityManager entityManager;
    
    @Resource
    UserTransaction utx;
    
    private static Logger logger = Logger.getLogger(UnitEntity.class.getName());
    
    
    public boolean addUnit(UnitEntity unit) throws Exception {
       try {
            utx.begin();
            entityManager.persist(unit);
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
   public boolean updateUnit(UnitEntity unit) {
      try {
         utx.begin();
         entityManager.merge(unit);
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
      }
    }
    
    public List<UnitEntity> getUnits(int gameID) throws Exception {
        TypedQuery<UnitEntity> query = entityManager.createNamedQuery("UNIT.selectByGameID",UnitEntity.class);
        query.setParameter("someID", gameID);
        
        return  query.getResultList();
    }
    
    public List<UnitEntity> getUnits(int gameID, int owner) throws Exception {
        TypedQuery<UnitEntity> query = entityManager.createNamedQuery("UNIT.selectByGameIDandOwner",UnitEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someOwner",owner);
        
        return query.getResultList();
    }
    
    public UnitEntity getUnitByLocalID(int gameID, int localID) throws Exception {
        TypedQuery<UnitEntity> query = entityManager.createNamedQuery("UNIT.selectByGameIDandLocalID",UnitEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someLocal",localID);
        
        if(query.getResultList().isEmpty())
           return null;
        return query.getResultList().get(0);
    }

    public List<UnitEntity> getUnitsByTile(int gameID, int tileID) throws Exception {
        TypedQuery<UnitEntity> query = entityManager.createNamedQuery("UNIT.selectByGameIDandTile",UnitEntity.class);
        query.setParameter("someID", gameID);
        query.setParameter("someTile",tileID);
        
        return query.getResultList();
    }
}
