
package org.tgp.vikings.server;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.io.Serializable;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import org.tgp.vikings.enums.TurnType;

/*
 * PlayerGameInfoEntity (or PGIE)
 *    these are used to link games with players
 * 
 * PlayerID p is in GameID g
 */



@Entity
@NamedQueries({
        @NamedQuery(name = "TURN.selectByGameIDandNumber",
                query = "SELECT x FROM TurnEntity x WHERE x.gameID=:someID AND x.turn=:someNum"),
        @NamedQuery(name = "TURN.selectByGameIDandNumberandOwner",
                query = "SELECT x FROM TurnEntity x WHERE x.gameID=:someID AND x.turn=:someNum AND x.owner=:someOwner"),
        @NamedQuery(name = "TURN.selectByGameIDandNumberandType",
                query = "SELECT x FROM TurnEntity x WHERE x.gameID=:someID AND x.turn=:someNum AND x.turnType=:someType"),
        @NamedQuery(name = "TURN.selectByGameIDandNumberandOwnerandType",
                query = "SELECT x FROM TurnEntity x WHERE x.gameID=:someID AND x.turn=:someNum AND x.owner=:someOwner AND x.turnType=:someType"),

})

@Table(name = "TURN_DIRECTORY")
public class TurnEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private static final long serialVersionUID = 1L;
    
    //associated ID's
    private int gameID;
    
    private int owner;//number(spot in PGIE table), not playerID
    private int turn;
    
    private TurnType turnType;
    private String[] instructions;
    

    public int getID(){
        return id;
    }
    
    public int getGameID(){ return gameID; }
    public void setGameID(int id){ gameID = id; }
    
    public int getOwner(){ return owner; }
    public void setOwner(int o){ owner = o; }
    
    public int getTurn(){ return turn; }
    public void setTurn(short num){ turn = num; }
    
    public TurnType getTurnType(){ return turnType;}
    public void setTurnType(TurnType tt){turnType = tt;}
    
    public String[] getInstructions(){ return instructions; }
    public void setInstructions(String[] instructions){ this.instructions = instructions; }
    
    @Override
    public String toString(){
        String i= "[";
        for(String s : instructions){
           i += s+",";
        }
        i +="]";
        return "g"+gameID+":t"+turn+" o"+owner+"],turnID["+id+"] type="+turnType.name()+" instructions="+i;
    }
    
}