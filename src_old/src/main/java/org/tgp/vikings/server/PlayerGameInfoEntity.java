
package org.tgp.vikings.server;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.io.Serializable;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import org.tgp.vikings.enums.PlayerGameStatus;

/*
 * PlayerGameInfoEntity (or PGIE)
 *    these are used to link games with players
 * 
 * PlayerID p is in GameID g
 */



@Entity
@NamedQueries({
        @NamedQuery(name = "PGIE.selectByGameID",
                query = "SELECT x FROM PlayerGameInfoEntity x WHERE x.gameID=:someID"),
        @NamedQuery(name = "PGIE.selectByPlayerID",
                query = "SELECT x FROM PlayerGameInfoEntity x WHERE x.playerID=:someID")
        

})

@Table(name = "PLAYERGAMEINFO_DIRECTORY")
public class PlayerGameInfoEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private static final long serialVersionUID = 1L;
    
    //associated ID's
    private int playerID;
    private int gameID;
    
    //in game stuff
    private short playerNum;//player 1, player 2, etc
    private PlayerGameStatus playerStatus;
    
    

    public int getID(){
        return id;
    }
    
    public int getGameID(){ return gameID; }
    public void setGameID(int id){ gameID = id; }
    
    public int getPlayerID(){ return playerID; }
    public void setPlayerID(int id){ playerID = id; }
    
    public short getPlayerNum(){ return playerNum; }
    public void setPlayerNum(short num){ playerNum = num; }
    
    public PlayerGameStatus getPlayerStatus(){ return playerStatus; }
    public void setPlayerStatus(PlayerGameStatus status){ playerStatus = status; }
    
    @Override
    public String toString(){
        return "pID="+playerID+" is in gID="+gameID+"["+playerNum+"], status="+playerStatus;
    }
    
}