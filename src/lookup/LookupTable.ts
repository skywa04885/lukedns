import {LookupTableZone} from "./LookupTableZone";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export interface LookupTableBranch {
    zone?: LookupTableZone,
    children: {[key: string]: LookupTableBranch};
}

export class LookupTable {
    protected static _instance: LookupTable;

    protected _zones: LookupTableZone[];
    protected _root_branch: LookupTableBranch;

    public get root_branch(): LookupTableBranch {
        return this._root_branch;
    }

    /**
     * The default constructor for the lookup table.
     * @protected
     */
    protected constructor() {
        this._zones = [];
        this._root_branch = {
            children: {}
        };
    }

    /**
     * Gets the lookup table instance.
     */
    public static get instance(): LookupTable {
        if (!this._instance) {
            this._instance = new LookupTable();
        }

        return this._instance;
    }

    public get zones(): LookupTableZone[] {
        return this._zones;
    }

    /**
     * Matches a zone to the given label sequence.
     * @param labels the labels.
     */
    public match_zone(labels: LabelSequence): LookupTableZone | undefined {
        // Starts looking for the zone.
        let branch: LookupTableBranch = this._root_branch;
        for (const label of labels.reverse_generator()) {
            // If the current branch has no child with the given label, return undefined.
            if (!branch.children[label]) {
                return undefined;
            }

            // Goes into the branch.
            branch = branch.children[label];

            // Checks if the current branch includes a zone, if so return it.
            if (branch.zone) {
                return branch.zone;
            }
        }

        // Returns the zone from the branch, which can be undefined if not there.
        return branch.zone;
    }

    /**
     * Inserts all the given zones.
     * @param zones the zones.
     */
    public insert_zones(zones: LookupTableZone[]): void {
        zones.forEach((zone: LookupTableZone): void => {
            this.insert_zone(zone);
        });
    }

    /**
     * Inserts a new zone into the lookup table.
     * @param zone the zone.
     */
    public insert_zone(zone: LookupTableZone): void {
        // Starts looping over the origin in reverse, and creates the branches.
        let branch: LookupTableBranch = this._root_branch;
        for (const label of zone.origin.reverse_generator()) {
            // If the branch exists, just go into it, and continue.
            if (branch.children[label]) {
                branch = branch.children[label];
                continue;
            }

            // Since the branch does not exist, create it.
            branch = branch.children[label] = {
                children: {}
            };
        }

        // Now that we've got the branch where we're supposed to insert the
        //  given zone, check if we're actually allowed to do this.
        if (branch.zone) {
            throw new Error('The given label is already associated with a zone!');
        } else if (Object.keys(branch.children).length !== 0) {
            throw new Error('The branch for the label already has zones underneath!');
        }

        // Assigns the zone to the branch.
        branch.zone = zone;

        // Pushes the zone to the zones array.
        this._zones.push(zone);
    }
}