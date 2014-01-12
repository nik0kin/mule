


package org.tgp.vikings.server;


import javax.enterprise.context.RequestScoped;

/**
 * This is a CDI bean that is used as a TileEntity holder.
 */
@RequestScoped
public class Tile {

    private TileEntity tileEntity = null;

    /**
     * Retrieve the {@link GameEntity} object stored in this CDI bean
     *
     * @return {@link GameEntity} object stored in this CDI bean.
     */
    public TileEntity getTileEntity() {
        return tileEntity;
    }

    /**
     * Set {@link TileEntity} object once per http request so that it is available
     * seemlessly across all the web components in the scope of that http request.
     *
     * @param TileEntity {@link TileEntity} entity to be set.
     */
    public void setGameEntity(TileEntity tileEntity) {
        this.tileEntity = tileEntity;
    }

}
