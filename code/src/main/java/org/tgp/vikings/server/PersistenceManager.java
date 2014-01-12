/*
 * Copyright (c) 2011, Oracle. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of Oracle nor the names of its contributors
 *   may be used to endorse or promote products derived from this software without
 *   specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.tgp.vikings.server;

import javax.annotation.Resource;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import javax.persistence.Query;
import javax.transaction.UserTransaction;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.tgp.vikings.enums.GameStatus;

/**
 * This is a CDI bean responsible for all database related operations.
 */
@SessionScoped
public class PersistenceManager implements Serializable {

   @Inject
   Game game;
   
   @Inject
   PGIEPersistence pgiePersistance;
   
   @PersistenceUnit(unitName = "TelephoneDirectory")
   private EntityManagerFactory emf;
   
   @Resource
   UserTransaction utx;
   private static Logger logger = Logger.getLogger(PersistenceManager.class.getName());

   /**
    * Stores a {@link GameEntity} into the database.
    *
    * @return true on success, false otherwise.
    */
   public boolean persist() {
      // EntityManager em = getEntityManager();
      EntityManager em = emf.createEntityManager();
      try {
         utx.begin();
         em.persist(game.getGameEntity());
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
         em.close();
      }
   }

   public boolean refresh() {
      EntityManager em = emf.createEntityManager();
      try {
         utx.begin();
         em.refresh(game.getGameEntity());
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
         em.close();
      }
   }

   public boolean update(GameEntity gameE) {
      EntityManager em = emf.createEntityManager();
      try {
         utx.begin();
         em.merge(gameE);
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
         em.close();
      }
   }

   public boolean flush() {
      EntityManager em = emf.createEntityManager();
      try {
         utx.begin();
         em.flush();
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
         em.close();
      }
   }

   /**
    * Retrieves all the {@link GameEntity} entries from the database.
    *
    * @return All the {@link GameEntity} entries available the database.
    */
   public List<GameEntity> getAllEntries() {
      EntityManager em = emf.createEntityManager();
      List allEntries = new ArrayList();
      try {
         Query q = em.createNamedQuery("allgameentries");
         allEntries = q.getResultList();
      } finally {
         em.close();
      }
      return allEntries;
   }

   //this will be used with ListGames
   //  which should retrieve two sets of list, and return one
   //    1. Games the player is in
   //    2. Games that are open
   
   //get players games
   public List<GameEntity> getPlayersGames(int playerID) {
      EntityManager em = emf.createEntityManager();
      List<GameEntity> games = new ArrayList<GameEntity>();
      
      //get gameIDs player is in thru pgie persistance
      List<PlayerGameInfoEntity> list = null;
      try{
          list = pgiePersistance.getPlayerGames(playerID);
      } catch(Exception e){
      
      }
      //convert them to GameEntitys
      if(list != null){
         for(PlayerGameInfoEntity pgie : list)
            games.add(getGameByID(pgie.getGameID()));
      }
      
      em.close();
      return games;
   }
   
   //get open games
   public List<GameEntity> getOpenGames() {
      EntityManager em = emf.createEntityManager();
      List<GameEntity> openGames = new ArrayList<GameEntity>();
      
      //get all games that are open
      try {
         Query q = em.createNamedQuery("Game.selectByGameStatus");
         q.setParameter("someStatus", GameStatus.open);
         for(Object g : q.getResultList())
            openGames.add((GameEntity)g);
      } catch(Exception e){
      
      }
      em.close();
      return openGames;
   }

   /**
    * Retrieves all the {@link PersonEntity} entries from the database which
    * match the given name.
    *
    * @param name Name as search key
    * @return All the {@link PersonEntity} entries from the database, which
    * match the given name.
    */
   public GameEntity getGameByID(int id) {
      EntityManager em = emf.createEntityManager();
      List games = new ArrayList();//should only be one
      try {
         Query q = em.createNamedQuery("searchgamebyid");
         q.setParameter("someid", id);
         games = q.getResultList();
      } finally {
         em.close();
      }
      return (GameEntity) games.get(0);
   }
   
   //and and re persist object
   // return -1 if invalid gameID
   public int getNextLocalUnitID(int gameID){
      GameEntity game = getGameByID(gameID);
      if(game == null) 
         return -1;
      
      int num = game.getNextLocalUnitIDCounter();
      
      update(game);
      
      return num;
   }
}
