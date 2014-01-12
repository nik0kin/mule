
package org.tgp.vikings.other;

import java.util.Random;
import org.json.JSONStringer;
import org.tgp.vikings.enums.TerrainType;

/**
 *
 * @author Niko
 */
public class MapGenerator {
    private static Random randy = new Random();
    
    
    public static TerrainType[][] getMap(int width, int height){
        TerrainType[][] map = new TerrainType[width][height];
        
        for(int x=0;x<width;x++){
            for(int y=0;y<height;y++){
                
                if(randy.nextDouble() > .3){
                    map[x][y] = TerrainType.grass;
                }else{
                    map[x][y] = TerrainType.trees;
                }
            }
        }
        
        return map;
    }
    
    public static JSONStringer getStringer(){
       
       return new JSONStringer();
    }
}
