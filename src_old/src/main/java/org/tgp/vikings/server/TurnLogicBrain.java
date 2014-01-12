/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.tgp.vikings.server;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import javax.enterprise.context.SessionScoped;
import javax.inject.Inject;
import org.json.JSONObject;
import org.tgp.vikings.enums.GameStatus;
import org.tgp.vikings.enums.TurnType;
import static org.tgp.vikings.enums.TurnType.create;
import static org.tgp.vikings.enums.TurnType.endturn;
import static org.tgp.vikings.enums.TurnType.move;

/**
 *
 * @author Niko
 */


@SessionScoped
public class TurnLogicBrain implements Serializable{
   @Inject
   PersistenceManager gamePersistence;
   @Inject
   TurnPersistence turnPersistence;
   @Inject
   PGIEPersistence pgiePersistence;
   @Inject
   UnitPersistence unitPersistence;
   @Inject
   TilePersistence tilePersistence;
   
   
   public class TurnInfo{
      private List<UnitEntity> unitStatus;
      private List<TurnEntity> turns;
      
      public TurnInfo(List<UnitEntity> unitStatus,List<TurnEntity> turns){
         this.turns = turns;
         this.unitStatus = unitStatus;
      }
      public List<UnitEntity> getUnitStatus(){
         return unitStatus;
      }
      public List<TurnEntity> getTurns(){
         return turns;
      }
   }
   
   // try to process Turn# turnNum
   // just execute every turn, progress turn on GameEntity
	//			- right now in any order
   public void update(int gameID, int turnNum) throws Exception{
      System.out.println("Calling Turn-Update on gID["+gameID+"]:"+turnNum);
      GameEntity game = gamePersistence.getGameByID(gameID);
      int numOfPlayers = game.getNumOfPlayers();
      
      //simple round robin for right now
      List<TurnEntity>[] allTurns = new List[numOfPlayers];
      for(int i=0; i < numOfPlayers; i++){
         allTurns[i] = turnPersistence.getTurnsByTurnNumberAndOwner(gameID, turnNum, i);
      }
      
      boolean playedAllTurns[] = new boolean[numOfPlayers];
      
      do{
         for(int i=0; i<numOfPlayers;i++){
            int lastTurn = -1;//for debugging
            try{
               if(!(playedAllTurns[i] = allTurns[i].isEmpty())){
                  TurnEntity t = allTurns[i].remove(0);
                  lastTurn = t.getID();
                  updateHelper(game, t);
               }
            }catch(Exception e){
               //skips this turn?
               System.out.println("Error in Turn update, player["+i+"], turn["+lastTurn+"]: ");
               e.printStackTrace();
            }
         }
         
         //check if all been played
         boolean allPlayed = true;
         for(boolean b : playedAllTurns)
            if(!b) allPlayed = false;
         if(allPlayed)
            break;
      }while(true);
      

      game.setTurn((short)(turnNum + 1));
      boolean gameUpdated = gamePersistence.update(game);
      if(gameUpdated)
            System.out.println("Successful Turn Update");
   }
   //to execute turns?
   private void updateHelper(GameEntity game, TurnEntity turn) throws Exception{
      System.out.println("Executing: "+turn.toString());
      String[] instructs = turn.getInstructions();
      switch(turn.getTurnType()){
         //////////////////////////////////
         case create:
         {
            //make UnitEntity at that loc
            int typeID = Integer.parseInt(instructs[0]);
            int tileID = Integer.parseInt(instructs[1]);
            
            UnitEntity unit = new UnitEntity();
            
            unit.setGameID(game.getID());
            unit.setLocalID(gamePersistence.getNextLocalUnitID(game.getID()));
            unit.setOwner(turn.getOwner());
            unit.setTileID(tileID);
            unit.setTypeID(typeID);
            
            unitPersistence.addUnit(unit);
         }
            break;
         //////////////////////////////////
         case move:
         {
            int localID = Integer.parseInt(instructs[0]);
            int tileID = Integer.parseInt(instructs[1]);//location moving too
            
            UnitEntity unit = unitPersistence.getUnitByLocalID(game.getID(), localID);
            unit.setTileID(tileID);
            
            if(!unitPersistence.updateUnit(unit)){
               throw new Exception("update Unit["+unit.getID()+"] (turn: "+turn.getID()+") failed");
            }
            
         }
            break;
         //////////////////////////////////
         case endturn:
            //do nothing
            break;
         //////////////////////////////////
         default:
            throw new Exception("invalid turntype");
         
      }
   }
   
   //checks if all players have sent a turn with ["endturn"], then calls update() if next turns ready
   //TODO later add a boolean on PlayerGameInfoEntity, that keeps track after endturn has been sent
   public boolean tryUpdate(int gameID, int turnNum) throws Exception{
      GameEntity game = gamePersistence.getGameByID(gameID);
      if(game.getTurn() != turnNum)
         return false;
      
      List<TurnEntity> turns = turnPersistence.getTurnsByTurnNumberAndType(gameID, turnNum, TurnType.endturn);
      int playersInGame = game.getNumOfPlayers();
      boolean[] played = new boolean[playersInGame];
      
      for(TurnEntity t : turns)
         played[t.getOwner()] = true;
      
      for(boolean b : played)
         if(!b) return false;
      
      update(gameID, turnNum);
      return true;
   }
   //if player == -1, give all info
   public TurnInfo getTurnInfo(int gameID, int turnNum, int player ) throws Exception{
      GameEntity game;
      //two safety checks
      if((game = gamePersistence.getGameByID(gameID)) == null){
         return null;
      }
      if(player < 0 || player >= game.getNumOfPlayers() ){
         return null;
      }
      //get dah info, just turns atm
      List<UnitEntity> units = unitPersistence.getUnits(gameID);
      /*List<String> unitStatus = new ArrayList();
      for(UnitEntity unit : units){
         unitStatus.add(unit.toString());
         
      }*/
      //all the turns, later it will depend on which player, fogofwar etc
      List<TurnEntity> turns = turnPersistence.getTurnsByTurnNumber(gameID, turnNum);
      TurnInfo ti = new TurnInfo(units,turns);
      
      return ti;
   }
   //player is position in valid gameID
   //return "" if valid turn and make a Turn Entity
   //   return why its not valid otherwise
   public String submitTurn(int gameID, int player, JSONObject turnObject) throws Exception{
      GameEntity game;
      //two safety checks
      if((game = gamePersistence.getGameByID(gameID)) == null){
         return "gameID does not exist";
      }
      if(player < 0 || player >= game.getNumOfPlayers() ){
         return "playerSpot invalid: "+player;
      }
      //maybe this check should be in SubmitTurn API
      if(game.getGameStatus() != GameStatus.inprogress)
         return "incorrect GameStatus["+game.getGameStatus()+"], can't submit turns";

      int t;
      try{
         t = turnObject.getInt("type");
      }catch(Exception e){
         return "Invalid type: "+turnObject.optString("type");
      }
      TurnEntity turn = new TurnEntity();
      turn.setOwner(player);
      turn.setGameID(gameID);
      turn.setTurn(game.getTurn());
      
      TurnType tt;
      try{
         tt = TurnType.values()[t];
      }catch(Exception e){
         return "invalid TurnType: "+t;
      }
      switch(tt){
         //////////////////////////////////
         case create:
            {
               //get turn parameters
               int unitTypeID;
               try{
                  unitTypeID = Integer.parseInt(turnObject.getString("unitTypeID"));
               }catch(Exception e){
                  return "create: invalid unitTypeID: "+turnObject.optString("unitTypeID");
               }
               String loc = turnObject.optString("loc");
               int location[] = new int[2];
               try{
                  String[] s = loc.split("_");
                  location[0] = Integer.parseInt(s[0]);
                  location[1] = Integer.parseInt(s[1]);
               }catch(Exception e){
                  return "invalid location: "+loc;
               }
                 //change loc to tileID
               String tileID;
               try{
                  tileID = ""+tilePersistence.getTileByLocation(gameID, location[0], location[1]).getID();
               }catch(Exception e){
                  return "trouble translating loc["+loc+"] to tileID";
               }

               //validate parameters

               //let all positive unitTypeID be valid ATM
               if(unitTypeID < 0)
                  return "invalid unitTypeID: "+unitTypeID;

               if(location[0] < 0 || location[0] >= game.getWidth())
                  return "invalid loc-X[0-"+game.getWidth()+"]: "+location[0];
               if(location[1] < 0 || location[1] >= game.getHeight())
                  return "invalid loc-Y[0-"+game.getWidth()+"]: "+location[1];

            
               //set instructions and persist
               String[] s = {unitTypeID+"",tileID};
               turn.setInstructions(s);
            }
            break;
         //////////////////////////////////
         case move:
            {
               //get turn parameters
               int unitID;
               try{
                  unitID = Integer.parseInt(turnObject.getString("unitID"));
               }catch(Exception e){
                  return "create: invalid unitID: "+turnObject.optString("unitID");
               }
               String loc = turnObject.optString("loc");
               int location[] = new int[2];
               try{
                  String[] s = loc.split("_");
                  location[0] = Integer.parseInt(s[0]);
                  location[1] = Integer.parseInt(s[1]);
               }catch(Exception e){
                  return "invalid location: "+loc;
               }
                 //change loc to tileID
               String tileID;
               try{
                  tileID = ""+tilePersistence.getTileByLocation(gameID, location[0], location[1]).getID();
               }catch(Exception e){
                  return "trouble translating loc["+loc+"] to tileID";
               }
               
               
               //validate parameters

               //unitID must exist
               UnitEntity unit;
               if((unit = unitPersistence.getUnitByLocalID(gameID, unitID)) == null)
                  return " localUnitID: "+unitID+" doesnt exist";

               if(location[0] < 0 || location[0] >= game.getWidth())
                  return "invalid loc-X[0-"+game.getWidth()+"]: "+location[0];
               if(location[1] < 0 || location[1] >= game.getHeight())
                  return "invalid loc-Y[0-"+game.getWidth()+"]: "+location[1];


               //set instructions and persist
            
               String[] s = {unitID+"",tileID};
               turn.setInstructions(s);
            }
            break;
         //////////////////////////////////
         case endturn:
            {
               String[] s = {};//nope
               turn.setInstructions(s);
            }
            break;
         //////////////////////////////////
         default:
            return "invalid TurnType: "+t;
            
      }
      turn.setTurnType(tt);
      
      try{
         turnPersistence.addTurn(turn);
         System.out.println("Added Turn: "+turn.toString());
      }catch(Exception e){
         return "failed to persist turn";
      }
      //try to do a turn
      try{
         tryUpdate(gameID,game.getTurn());
      }catch(Exception e){
         e.printStackTrace();
      }
         
      return "";
   }
   //convert TurnEntity to JSONObject
   public JSONObject getJSON(TurnEntity turn) throws Exception{
      if(turn == null) return null;
      TurnType type = turn.getTurnType();
      
      JSONObject obj = new JSONObject();
      obj.put("type", type.ordinal());
      obj.put("playerNum", turn.getOwner());
      
      switch(type){
         case create:
         {
            obj.put("typeID", turn.getInstructions()[0]);
            //obj.put("loc", turn.getInstructions()[1]);
            
            int tileID = Integer.parseInt(turn.getInstructions()[1]);
            int loc[] = tilePersistence.getTileByID(tileID).getPosition();
            obj.put("locX",loc[0]);
            obj.put("locY",loc[1]);
         }
            break;
         case move:
         {
            obj.put("unitID", turn.getInstructions()[0]);
            //obj.put("loc", turn.getInstructions()[1]);
            
            int tileID = Integer.parseInt(turn.getInstructions()[1]);
            int loc[] = tilePersistence.getTileByID(tileID).getPosition();
            obj.put("locX",loc[0]);
            obj.put("locY",loc[1]);
         }
            break;
         case endturn:
            return null;
      }
      
      return obj;
   }
   
   public JSONObject getJSON(UnitEntity unit) throws Exception{
      if(unit == null) return null;

      
      JSONObject obj = new JSONObject();
      obj.put("unitTypeID", unit.getTypeID());
      obj.put("playerNum", unit.getOwner());
      obj.put("id", unit.getLocalID());//localID
      int tileID = unit.getTileID();
      int loc[] = tilePersistence.getTileByID(tileID).getPosition();
      obj.put("locX",loc[0]);
      obj.put("locY",loc[1]);
      
      return obj;
   }
}
