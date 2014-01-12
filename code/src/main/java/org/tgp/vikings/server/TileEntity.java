
package org.tgp.vikings.server;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.io.Serializable;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import org.tgp.vikings.enums.TerrainType;


@Entity
@NamedQueries({
        @NamedQuery(name = "TILE.selectByTileID",
                query = "SELECT x FROM TileEntity x WHERE x.id=:someID"),
        @NamedQuery(name = "selectbygameid",
                query = "SELECT x FROM TileEntity x WHERE x.gameID=:someID"),
        @NamedQuery(name = "selectbygameidandlocation",
                query = "SELECT x FROM TileEntity x WHERE x.gameID=:someID AND x.positionX=:someX AND x.positionY=:someY")
        

})
@Table(name = "TILE_DIRECTORY")
public class TileEntity implements Serializable {

    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private static final long serialVersionUID = 1L;
    
    private int gameID;
    
    private int positionX;
    private int positionY;
    private TerrainType terrainType;
    
    

    public int getID(){
        return id;
    }
    
    public int getGameID(){ return gameID; }
    
    public void setGameID(int id){ gameID = id; }
    
    public int[] getPosition(){
        return new int[]{positionX, positionY};
    }
    
    public void setPosition(int[] pos){
        positionX = pos[0];
        positionY = pos[1];
    }
    
    public TerrainType getTerrainType(){
        return terrainType;
    }
    
    public void setTerrainType(TerrainType t){
        terrainType = t;
    }
    
    @Override
    public String toString(){
        return "id="+id+" gameID="+gameID+" ["+positionX+","+positionY+"] terrain: "+terrainType;
    }
    
}