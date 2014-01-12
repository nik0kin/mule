
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
        @NamedQuery(name = "UNIT.selectByGameID",
                query = "SELECT x FROM UnitEntity x WHERE x.gameID=:someID"),
        @NamedQuery(name = "UNIT.selectByGameIDandLocalID",
                query = "SELECT x FROM UnitEntity x WHERE x.gameID=:someID AND x.localID=:someLocal"),
        @NamedQuery(name = "UNIT.selectByGameIDandOwner",
                query = "SELECT x FROM UnitEntity x WHERE x.gameID=:someID AND x.owner=:someOwner"),
        @NamedQuery(name = "UNIT.selectByGameIDandTile",
                query = "SELECT x FROM UnitEntity x WHERE x.gameID=:someID AND x.tileID=:someTile")
        

})

@Table(name = "UNIT_DIRECTORY")
public class UnitEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private int localID;//per game ID
    
    private static final long serialVersionUID = 1L;
    
    //associated ID's
    private int gameID;
    
    private int owner;
    
    //ingame stuff
    private int typeID;
    private int tileID;
    

    public int getID(){
        return id;
    }
    
    public int getLocalID(){ return localID; }
    public void setLocalID(int lID){ localID = lID; }
    
    public int getGameID(){ return gameID; }
    public void setGameID(int id){ gameID = id; }
    
    public int getOwner(){ return owner; }
    public void setOwner(int o){ owner = o; }
    
    public int getTypeID(){ return typeID; }
    public void setTypeID(int tID){ typeID = tID; }
    
    public int getTileID(){ return tileID; }
    public void setTileID(int tID){ tileID = tID; }
    

    
    @Override
    public String toString(){
        return "id="+id+"["+localID+"] is a unit owned by p"+owner+" at tileID="+tileID+"in game="+gameID;
    }
    
}