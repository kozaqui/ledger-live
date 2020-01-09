import React, { useState, useCallback, useMemo, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import type { State, Action } from "@ledgerhq/live-common/lib/apps";
import { Trans } from "react-i18next";

import UpdateAllModal from "../Modals/UpdateAllModal";
import LText from "../../../components/LText";
import colors from "../../../colors";
import Info from "../../../icons/Info";
import ProgressBar from "../../../components/ProgressBar";

type Props = {
  state: State,
  dispatch: Action => void,
};

const AppUpdateAll = ({ state, dispatch }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [appsUpdating, setAppsUpdating] = useState([]);
  const { installed, apps, installQueue } = state;
  const appsToUpdate = useMemo(
    () =>
      apps.filter(app =>
        installed.some(({ name, updated }) => name === app.name && !updated),
      ),
    [apps, installed],
  );

  const updateProgress = useMemo(
    () =>
      (1e2 * (appsUpdating.length - installQueue.length)) / appsUpdating.length,
    [installQueue, appsUpdating],
  );

  useEffect(() => {
    if (updateProgress === 100) {
      setAppsUpdating([]);
    }
  }, [updateProgress]);

  const openModal = useCallback(() => setModalOpen(true), [setModalOpen]);
  const closeModal = useCallback(() => setModalOpen(false), [setModalOpen]);
  const updateAll = useCallback(() => {
    dispatch({ type: "updateAll" });
    setModalOpen(false);
    setAppsUpdating(appsToUpdate);
  }, [appsToUpdate, dispatch]);

  if (appsUpdating.length) {
    return (
      <View style={styles.root}>
        <LText semiBold style={[styles.infoText, { flex: 1 }]}>
          <Trans
            i18nKey="AppAction.update.countdown"
            values={{
              total: appsUpdating.length,
              number: appsUpdating.length - installQueue.length,
            }}
          />
        </LText>
        <ProgressBar
          style={{ marginLeft: 16 }}
          progress={updateProgress}
          progressColor={colors.live}
        />
      </View>
    );
  }

  if (appsToUpdate.length <= 0) return null;

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.infoLabel}
        activeOpacity={0.5}
        onPress={openModal}
      >
        <LText semiBold style={styles.infoText}>
          <Trans
            i18nKey="AppAction.update.title"
            values={{ number: appsToUpdate.length }}
          />
        </LText>
        <Info size={17} color={colors.live} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={updateAll}>
        <LText semiBold style={styles.buttonText}>
          <Trans i18nKey="AppAction.update.button" />
        </LText>
      </TouchableOpacity>
      <UpdateAllModal
        isOpened={modalOpen}
        apps={appsToUpdate}
        onClose={closeModal}
        onConfirm={updateAll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    height: 60,
    width: "100%",
    marginTop: 30,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  infoLabel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 38,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 17,
    color: colors.live,
    marginRight: 6,
  },
  button: {
    flexBasis: "auto",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  buttonText: {
    fontSize: 14,
    color: colors.white,
  },
});

export default AppUpdateAll;
