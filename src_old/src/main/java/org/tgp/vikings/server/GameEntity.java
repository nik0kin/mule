
package org.tgp.vikings.server;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.io.Serializable;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import org.tgp.vikings.enums.GameStatus;

/**
 * Represents a telephone directory entry in the database for a person.
 */
@Entity
@NamedQueries({
        @NamedQuery(name = "allgameentries",
                query = "SELECT x FROM GameEntity x"),
        @NamedQuery(name = "searchgamebyid",
                query = "SELECT x FROM GameEntity x WHERE x.id=:someid"),
        @NamedQuery(name = "Game.selectByGameStatus",
                query = "SELECT x FROM GameEntity x WHERE x.gameStatus=:someStatus")

})
@Table(name = "GAME_DIRECTORY")
public class GameEntity implements Serializable, Comparable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private int width, height;
    
    private String name;
    
    private int numOfPlayers;
    
    private GameStatus gameStatus;
    
    private short turn;
    
    private TileEntity map[][];
    
    private int currentLocalIDcounter;//just a counter
    
    /**
     * Gets the address of the person.
     * @return Address of the person.
     */
    public int getID() {
        return id;
    }

    public String getName(){ return name; }
    public void setName(String name){ this.name = name; } 
    
    public int getWidth(){ return width; }
    public void setWidth(int w){ width = w; }
    public int getHeight(){ return height; }
    public void setHeight(int h){ height = h; }

    
    public void setTurn(short t){turn = t;}
    public short getTurn(){ return turn; } 
    
    public GameStatus getGameStatus(){
       return gameStatus;
    }
    public void setGameStatus(GameStatus gs){
       gameStatus = gs;
    }
    
    public int getNumOfPlayers(){ return numOfPlayers; }
    public void setNumOfPlayers(int num){ numOfPlayers = num; }
   
    public void setMap(TileEntity map[][]){
       this.map = map;
    }
    public TileEntity[][] getMap(){
       return map;
    }
    
    public void startLocalUnitIDCounter(){
       currentLocalIDcounter = 0;
    }
    public int getNextLocalUnitIDCounter(){
       return currentLocalIDcounter++;
    }
    

    
    @Override
    public boolean equals(Object g){
       return id == ((GameEntity)g).id;
    }

   public int compareTo(Object o) {
      return id - ((GameEntity)o).id;
   }
}
