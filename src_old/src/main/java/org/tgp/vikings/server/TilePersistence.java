/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
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
 * learned from:
 *    http://tomee.apache.org/examples-trunk/injection-of-entitymanager/
 *    http://stackoverflow.com/questions/4051273/what-to-put-into-jta-data-source-of-persistence-xml
 * 
 */

@SessionScoped
public class TilePersistence  implements Serializable{
    @PersistenceContext(unitName = "tile-unit")
    private EntityManager entityManager;

    @Resource
    UserTransaction utx;
    
    private static Logger logger = Logger.getLogger(TilePersistence.class.getName());
    
    
    public boolean addTile(TileEntity tile) throws Exception {
       try {
            utx.begin();
            entityManager.persist(tile);
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
    public TileEntity getTileByID(int tileID) throws Exception{
       Query query = entityManager.createNamedQuery("TILE.selectByTileID");
       query.setParameter("someID", tileID);
       
       if(query.getResultList().isEmpty())
          return null;
       return (TileEntity) query.getResultList().get(0);
    }

    public List<TileEntity> getTilesForGameID(int gameID) throws Exception {
        Query query = entityManager.createNamedQuery("selectbygameid");
        query.setParameter("someID", gameID);
        return query.getResultList();
    }
    public TileEntity getTileByLocation(int gameID, int x, int y){
       Query query = entityManager.createNamedQuery("selectbygameidandlocation");
       query.setParameter("someID", gameID);
       query.setParameter("someX",x);
       query.setParameter("someY",y);
       if(query.getResultList().isEmpty())
          return null;
       return (TileEntity) query.getResultList().get(0);
       
    }
}
