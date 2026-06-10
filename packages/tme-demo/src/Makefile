all: fxs
.PHONY: all

# Include standard NCS examples build definitions and rules
include $(NCS_DIR)/src/ncs/build/include.ncs.mk

SRC = $(wildcard yang/*.yang)
COMMON_YANG_DIR = ../../../common-topology/yang
COMMON_YANG = $(wildcard $(COMMON_YANG_DIR)/*.yang.in)
COMMON_SUBMODULE_DIR = ../load-dir/generated-yang
COMMON_SUBMODULES = $(COMMON_YANG:$(COMMON_YANG_DIR)/%.yang.in=$(COMMON_SUBMODULE_DIR)/%.yang)
DIRS = ../load-dir $(COMMON_SUBMODULE_DIR) java/src/$(JDIR)/$(NS)
FXS = $(SRC:yang/%.yang=../load-dir/%.fxs)

## Uncomment and patch the line below if you have a dependency to a NED
## or to other YANG files
# YANGPATH += ../../<ned-name>/src/ncsc-out/modules/yang \
# 	../../<pkt-name>/src/yang

YANGPATH += $(COMMON_SUBMODULE_DIR) \
	          ../../cisco-ios/src/ncsc-out/modules/yang \
	          ../../cisco-ios/src/ \
	          ../../cisco-iosxr/src/ncsc-out/modules/yang \
	          ../../cisco-iosxr/src/ \
	          ../../juniper-junos/src/ncsc-out/modules/yang \
	          ../../juniper-junos/src \
	          ../../alu-sr/src/ncsc-out/modules/yang \
	          ../../alu-sr/src \
	          ../../cisco-nx/src/ncsc-out/modules/yang \
	          ../../cisco-nx/src \
	          ../../dell-ftos/src/ncsc-out/modules/yang \
	          ../../dell-ftos/src \
	          ../../l3vpn/src/yang

NCSCPATH   = $(YANGPATH:%=--yangpath %)
YANGERPATH = $(YANGPATH:%=--path %)

fxs: $(DIRS) $(FXS)

$(DIRS):
	mkdir -p $@

$(FXS): $(COMMON_SUBMODULES)

$(COMMON_SUBMODULE_DIR)/%.yang: $(COMMON_YANG_DIR)/%.yang.in | $(COMMON_SUBMODULE_DIR)
	sed -e 's|@PARENT_MODULE@|tme-demo|g' \
	    -e 's|@PARENT_PREFIX@|tme-demo|g' \
	    $< > $@

../load-dir/%.fxs: yang/%.yang
	$(NCSC)  `ls $*-ann.yang  > /dev/null 2>&1 && echo "-a $*-ann.yang"` \
             $(NCSCPATH) -c -o $@ $<

clean:
	rm -rf $(DIRS)
.PHONY: clean
